# FE Quiz API — Oracle systemd deployment

Run the FastAPI backend permanently on the Oracle VM, bound to `127.0.0.1:8010`.

- App dir: `/opt/fe-quiz-api`
- Virtualenv: `/opt/fe-quiz-api/.venv`
- Env file: `/etc/fe-quiz-api.env`
- Service user: `ubuntu`
- Port: **8010** (8000 is taken by the existing downloader API — do not use it)
- **Local-only for now.** No nginx, not publicly exposed yet.

All commands run on the Oracle VM.

## 1. Create app dir

```bash
sudo mkdir -p /opt/fe-quiz-api
sudo chown ubuntu:ubuntu /opt/fe-quiz-api
```

## 2. Copy backend files

From your machine (adjust source path + VM host):

```bash
scp oracle/backend/main.py oracle/backend/requirements.txt \
    ubuntu@<ORACLE_VM>:/opt/fe-quiz-api/
```

Or, if the repo is already cloned on the VM:

```bash
cp /path/to/repo/oracle/backend/main.py /opt/fe-quiz-api/
cp /path/to/repo/oracle/backend/requirements.txt /opt/fe-quiz-api/
```

## 3. Create venv

```bash
cd /opt/fe-quiz-api
python3 -m venv .venv
```

## 4. Install requirements

```bash
/opt/fe-quiz-api/.venv/bin/pip install --upgrade pip
/opt/fe-quiz-api/.venv/bin/pip install -r /opt/fe-quiz-api/requirements.txt
```

## 5. Create the env file

Holds the DB connection string (never commit it; password is not hardcoded anywhere).

```bash
sudo tee /etc/fe-quiz-api.env > /dev/null <<'EOF'
FE_QUIZ_DATABASE_URL=postgresql://fe_quiz_app:REPLACE_WITH_REAL_PASSWORD@127.0.0.1:5432/fe_quiz
EOF
sudo chown root:ubuntu /etc/fe-quiz-api.env
sudo chmod 640 /etc/fe-quiz-api.env
```

Edit `/etc/fe-quiz-api.env` and replace `REPLACE_WITH_REAL_PASSWORD` with the real
`fe_quiz_app` password.

## 6. Install the systemd service

```bash
sudo cp /opt/fe-quiz-api/fe-quiz-api.service.example \
        /etc/systemd/system/fe-quiz-api.service
# (or scp the example file straight to /etc/systemd/system/fe-quiz-api.service)
sudo systemctl daemon-reload
sudo systemctl enable fe-quiz-api
```

## 7. Start the service

```bash
sudo systemctl start fe-quiz-api
```

## 8. Check status

```bash
sudo systemctl status fe-quiz-api
```

## 9. Test local endpoints

Local-only, so curl from the VM itself:

```bash
curl http://127.0.0.1:8010/api/fe/health
curl http://127.0.0.1:8010/api/fe/exam-sets
curl http://127.0.0.1:8010/api/fe/exam-sets/fe-2025-a-public/questions
```

Expected: health returns `{"ok":true,"database":true}`; exam-sets lists
`fe-2025-a-public`; questions returns the 20 imported questions.

## 10. View logs

```bash
sudo journalctl -u fe-quiz-api -f          # follow live
sudo journalctl -u fe-quiz-api -n 100      # last 100 lines
```

## Restart after a code or env change

```bash
sudo systemctl restart fe-quiz-api
```
