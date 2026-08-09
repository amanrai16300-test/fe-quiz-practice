# FE Quiz — Oracle FastAPI backend (read-only skeleton).
#
#   Env:  FE_QUIZ_DATABASE_URL=postgresql://user:pass@127.0.0.1:5432/fe_quiz
#   Run:  uvicorn main:app --host 127.0.0.1 --port 8010
#
# Read-only: serves the imported quiz content (exam_sets + questions). No auth,
# no users, no progress/session endpoints yet. Schema: oracle/schema.sql.

import os

import psycopg
from psycopg.rows import dict_row
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

DB_URL = os.environ.get("FE_QUIZ_DATABASE_URL")

app = FastAPI(title="FE Quiz Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET", "POST", "DELETE"],
    # X-FE-User-Key must be allowed through CORS for the browser to send it.
    allow_headers=["*"],
)


def get_conn():
    # One short-lived connection per request. ponytail: no pool yet — add one if
    # request volume ever justifies it. Password comes from the env URL, never code.
    if not DB_URL:
        raise HTTPException(status_code=500, detail="FE_QUIZ_DATABASE_URL not set")
    try:
        return psycopg.connect(DB_URL, row_factory=dict_row)
    except psycopg.Error as e:
        raise HTTPException(status_code=503, detail=f"Database connection failed: {e}")


@app.get("/api/fe/health")
def health():
    # ok=true always (process is up); database flag reports connectivity.
    if not DB_URL:
        return {"ok": True, "database": False, "detail": "FE_QUIZ_DATABASE_URL not set"}
    try:
        with psycopg.connect(DB_URL) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                cur.fetchone()
        return {"ok": True, "database": True}
    except psycopg.Error as e:
        return {"ok": True, "database": False, "detail": str(e)}


@app.get("/api/fe/exam-sets")
def list_exam_sets():
    try:
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, title, description, question_count
                FROM public.exam_sets
                ORDER BY id
                """
            )
            return {"exam_sets": cur.fetchall()}
    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {e}")


@app.get("/api/fe/exam-sets/{exam_set_id}/questions")
def get_questions(exam_set_id: str):
    try:
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute(
                "SELECT 1 FROM public.exam_sets WHERE id = %s", (exam_set_id,)
            )
            if cur.fetchone() is None:
                raise HTTPException(status_code=404, detail="Exam set not found")

            cur.execute(
                """
                SELECT number, body, options, correct_answer, explanation, image_path
                FROM public.questions
                WHERE exam_set_id = %s
                ORDER BY number
                """,
                (exam_set_id,),
            )
            rows = cur.fetchall()
    except HTTPException:
        raise
    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {e}")

    # body jsonb holds translated/display metadata; flatten additively for clients.
    questions = []
    for r in rows:
        body = r["body"] or {}
        questions.append(
            {
                "number": r["number"],
                "jp": body.get("jp"),
                "romaji": body.get("romaji"),
                "en": body.get("en"),
                "optionMode": body.get("optionMode"),
                "displayNumber": body.get("displayNumber"),
                # 科目B program blocks / tables; absent (None) for 科目A.
                "supplementalHtml": body.get("supplementalHtml"),
                # 科目B original exam crop images (list); absent (None) for 科目A.
                "imagePaths": body.get("imagePaths"),
                "options": r["options"],
                "correct_answer": r["correct_answer"],
                "explanation": r["explanation"],
                "image_path": r["image_path"],
            }
        )
    return {"exam_set_id": exam_set_id, "questions": questions}


# ===========================================================================
# Progress endpoints (per-user, write + read).
#
# Auth: simple client-generated key in the X-FE-User-Key header. No password /
# email / JWT / session yet. The key is stored as users.username (unique). An
# unknown key creates a user row. user_id is ALWAYS derived server-side from
# this header — never accepted from the request body. (schema.sql §SECURITY)
# ===========================================================================


def resolve_user_id(cur, user_key: str) -> str:
    # Map header key -> users.id, creating the row on first sight. ON CONFLICT
    # makes this idempotent under the username unique constraint. Returns uuid.
    cur.execute(
        """
        INSERT INTO public.users (username)
        VALUES (%s)
        ON CONFLICT (username) DO UPDATE SET username = EXCLUDED.username
        RETURNING id
        """,
        (user_key,),
    )
    return cur.fetchone()["id"]


def require_user_key(x_fe_user_key: str | None) -> str:
    key = (x_fe_user_key or "").strip()
    if not key:
        raise HTTPException(status_code=401, detail="X-FE-User-Key header required")
    return key


# Per-question progress item. Frontend keys questions by `number` (問N), but
# question_progress keys by question_id (uuid) — we map number -> id below.
# Client sends `selected_answer`; it maps to the question_progress.selected column.
class ProgressItem(BaseModel):
    number: int
    selected_answer: str | None = None
    submitted: bool = False
    is_correct: bool | None = None

    @property
    def is_submitted(self) -> bool:
        # Answered = a selected answer exists, OR client explicitly flagged submitted.
        return self.submitted or bool(self.selected_answer)


class ProgressIn(BaseModel):
    # NOTE: no user_id field — ownership comes from the header, not the body.
    items: list[ProgressItem] = []
    # Field-name mapping: frontend "current"/"furthest" -> session index columns.
    current_question_index: int = 0
    furthest_question_index: int = 0


@app.get("/api/fe/progress/{exam_set_id}")
def get_progress(exam_set_id: str, x_fe_user_key: str | None = Header(default=None)):
    user_key = require_user_key(x_fe_user_key)
    try:
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute(
                "SELECT question_count FROM public.exam_sets WHERE id = %s",
                (exam_set_id,),
            )
            es = cur.fetchone()
            if es is None:
                raise HTTPException(status_code=404, detail="Exam set not found")

            user_id = resolve_user_id(cur, user_key)

            # Per-question answers, joined to question number for the frontend.
            cur.execute(
                """
                SELECT q.number, qp.selected, qp.submitted, qp.is_correct
                FROM public.question_progress qp
                JOIN public.questions q ON q.id = qp.question_id
                WHERE qp.user_id = %s AND qp.exam_set_id = %s
                ORDER BY q.number
                """,
                (user_id, exam_set_id),
            )
            # Expose the DB `selected` column as `selected_answer` (the one public
            # field name). submitted is true if a selected answer exists.
            items = [
                {
                    "number": r["number"],
                    "selected_answer": r["selected"],
                    "submitted": r["submitted"] or bool(r["selected"]),
                    "is_correct": r["is_correct"],
                }
                for r in cur.fetchall()
            ]

            cur.execute(
                """
                SELECT current_question_index, furthest_question_index
                FROM public.quiz_sessions
                WHERE user_id = %s AND exam_set_id = %s
                """,
                (user_id, exam_set_id),
            )
            sess = cur.fetchone()
    except HTTPException:
        raise
    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=f"Query failed: {e}")

    current = sess["current_question_index"] if sess else 0
    furthest = sess["furthest_question_index"] if sess else 0
    qcount = es["question_count"] or 0
    return {
        "exam_set_id": exam_set_id,
        "items": items,  # [{number, selected_answer, submitted, is_correct}]
        "current_question_index": current,
        "furthest_question_index": furthest,
        # No `completed` column in schema — derive it (furthest reached last slot).
        "completed": qcount > 0 and furthest >= qcount - 1,
    }


@app.post("/api/fe/progress/{exam_set_id}")
def save_progress(
    exam_set_id: str,
    payload: ProgressIn,
    x_fe_user_key: str | None = Header(default=None),
):
    user_key = require_user_key(x_fe_user_key)
    try:
        # Single transaction for the whole upsert (psycopg commits on clean exit).
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute(
                "SELECT 1 FROM public.exam_sets WHERE id = %s", (exam_set_id,)
            )
            if cur.fetchone() is None:
                raise HTTPException(status_code=404, detail="Exam set not found")

            user_id = resolve_user_id(cur, user_key)

            # Map frontend question `number` -> question_id (uuid) for this paper.
            cur.execute(
                "SELECT number, id FROM public.questions WHERE exam_set_id = %s",
                (exam_set_id,),
            )
            number_to_id = {r["number"]: r["id"] for r in cur.fetchall()}

            for item in payload.items:
                qid = number_to_id.get(item.number)
                if qid is None:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Unknown question number {item.number}",
                    )
                # user_id is server-derived; client cannot target another user.
                cur.execute(
                    """
                    INSERT INTO public.question_progress
                        (user_id, exam_set_id, question_id, selected, submitted, is_correct)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (user_id, exam_set_id, question_id) DO UPDATE SET
                        selected   = EXCLUDED.selected,
                        submitted  = EXCLUDED.submitted,
                        is_correct = EXCLUDED.is_correct
                    """,
                    (
                        user_id,
                        exam_set_id,
                        qid,
                        item.selected_answer,
                        item.is_submitted,
                        item.is_correct,
                    ),
                )

            # Session indices. furthest is a high-water mark: clamp in-app with
            # GREATEST(stored, incoming); the guard_furthest_index() trigger is
            # the DB backstop. The clamp here keeps that no-regress behavior.
            cur.execute(
                """
                INSERT INTO public.quiz_sessions
                    (user_id, exam_set_id, current_question_index, furthest_question_index)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (user_id, exam_set_id) DO UPDATE SET
                    current_question_index  = EXCLUDED.current_question_index,
                    furthest_question_index =
                        GREATEST(quiz_sessions.furthest_question_index,
                                 EXCLUDED.furthest_question_index)
                """,
                (
                    user_id,
                    exam_set_id,
                    payload.current_question_index,
                    payload.furthest_question_index,
                ),
            )
    except HTTPException:
        raise
    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=f"Write failed: {e}")

    return {"ok": True}


@app.delete("/api/fe/progress/{exam_set_id}")
def reset_progress(
    exam_set_id: str, x_fe_user_key: str | None = Header(default=None)
):
    # Wipe this user's progress for ONE paper so they can restart from 問1.
    # Deletes the quiz_sessions row outright (not zeroing it) — the
    # guard_furthest_index() no-regress trigger would block lowering the index,
    # so removal is the only clean reset. user_id is server-derived; a user can
    # never target another user's rows.
    user_key = require_user_key(x_fe_user_key)
    try:
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute(
                "SELECT 1 FROM public.exam_sets WHERE id = %s", (exam_set_id,)
            )
            if cur.fetchone() is None:
                raise HTTPException(status_code=404, detail="Exam set not found")

            user_id = resolve_user_id(cur, user_key)
            cur.execute(
                "DELETE FROM public.question_progress WHERE user_id = %s AND exam_set_id = %s",
                (user_id, exam_set_id),
            )
            cur.execute(
                "DELETE FROM public.quiz_sessions WHERE user_id = %s AND exam_set_id = %s",
                (user_id, exam_set_id),
            )
    except HTTPException:
        raise
    except psycopg.Error as e:
        raise HTTPException(status_code=500, detail=f"Reset failed: {e}")

    return {"ok": True}
