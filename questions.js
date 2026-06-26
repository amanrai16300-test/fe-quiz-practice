// FE 2025 科目A — public sample (問1〜問20).
// Question/option JP text: from 2025_科目A.md (source of truth for text).
// correctAnswer: from answer-sheet.png answer key (ア=0, イ=1, ウ=2, エ=3).
// jp/romaji/en: beginner-friendly study translations (Hepburn romaji, simple English).
// explanation: STUBBED for MVP — fill later.
// imagePath: diagram questions (問3, 問14). Image files expected at the paths below.
// ponytail: data inlined as a JS module (no fetch, no build step) — smallest path that works.

const OPTION_LABELS = ["ア", "イ", "ウ", "エ"];

const QUESTIONS = [
  {
    id: 1,
    number: "問1",
    jp: "大規模言語モデルを用いた自然言語処理において，事前学習済みのモデルに対して行う，ファインチューニングに関する記述として，最も適切なものはどれか。",
    romaji: "Daikibo gengo moderu o mochiita shizen gengo shori ni oite, jizen gakushuuzumi no moderu ni taishite okonau, fain chuuningu ni kansuru kijutsu to shite, mottomo tekisetsu na mono wa dore ka.",
    en: "In natural language processing using a large language model, which statement about fine-tuning a pre-trained model is the most appropriate?",
    options: [
      { jp: "強化学習を行い，最適な結果が得られるようにする。", romaji: "Kyouka gakushuu o okonai, saiteki na kekka ga erareru you ni suru.", en: "Do reinforcement learning so that the best result is obtained." },
      { jp: "事前学習と同じデータを繰り返し用いて学習を行い，モデルの精度を高めるようにする。", romaji: "Jizen gakushuu to onaji deeta o kurikaeshi mochiite gakushuu o okonai, moderu no seido o takameru you ni suru.", en: "Train repeatedly with the same data as pre-training to raise the model's accuracy." },
      { jp: "大量のテキストデータを用いて学習を行い，モデルの精度を高めるようにする。", romaji: "Tairyou no tekisuto deeta o mochiite gakushuu o okonai, moderu no seido o takameru you ni suru.", en: "Train with a large amount of text data to raise the model's accuracy." },
      { jp: "特定のデータを用いて追加で学習を行い，目的とするタスクに適用できるようにする。", romaji: "Tokutei no deeta o mochiite tsuika de gakushuu o okonai, mokuteki to suru tasuku ni tekiyou dekiru you ni suru.", en: "Do extra training with specific data so the model fits a target task." },
    ],
    correctAnswer: 3, // エ
    imagePath: null,
    explanation: `ELI5:
Imagine a chef who already knows how to cook everything in general. That broad training is pre-training. Fine-tuning is like sending that chef to a sushi restaurant for a few weeks to get really good at sushi specifically. You are not teaching them to cook from scratch. You are taking someone who already knows cooking and sharpening them for one specific job using targeted practice.

Now think about the wrong options: option ア would be like the chef only improving when diners give thumbs up or thumbs down after each dish. That is a different kind of training called reinforcement learning, and it happens later, not during fine-tuning. Option イ would be making the chef repeat the exact same general cooking school lessons over and over. That does not teach them anything new about sushi. Option ウ is the original cooking school itself. Lots of general content, not task-specific at all.

Technical breakdown:
Fine-tuning is a transfer learning technique. A model already pre-trained on a large general corpus is taken and trained further on a smaller, task-specific labeled dataset. Three things define it precisely:

1. The base model is already trained. Fine-tuning is additional training, not training from scratch.
2. The dataset is small and task-specific. For example, labeled examples for sentiment analysis, legal document classification, medical question answering, or summarization.
3. The training is typically supervised. Input-output pairs guide the model toward the target task. This is structurally different from pre-training, which is unsupervised or self-supervised on raw unlabeled text.

Option ウ describes pre-training: massive general text, unsupervised, building broad language understanding from zero. Option ア describes reinforcement learning from human feedback (RLHF), which uses a reward signal and policy optimization. That is a separate alignment technique applied after fine-tuning, not part of fine-tuning itself. Option イ is simply re-running pre-training on the same data, which causes overfitting and produces no task adaptation.

Wrong answer analysis:
ア — RLHF is a legitimate LLM training technique, which makes this option a realistic trap. The key reason it is wrong: fine-tuning does not use a reward signal or policy optimization. It uses supervised learning on labeled task-specific data. RLHF is a separate step that may come after fine-tuning to align model outputs with human preferences. Picking ア confuses the order and mechanism of these two distinct training phases.

イ — Repeating the same pre-training data is not fine-tuning and is not useful. Fine-tuning requires new data the model has not been optimized for, specifically chosen to represent the target task. Replaying the original corpus just reinforces what the model already learned and risks overfitting without any task adaptation.

ウ — Training on large amounts of general text data is the definition of pre-training, not fine-tuning. The critical structural difference is that pre-training is unsupervised on raw text while fine-tuning is supervised on labeled task-specific examples. Data size alone is not the only distinction. The supervision signal and task specificity are what separate them.

Correct answer: エ`,
  },
  {
    id: 2,
    number: "問2",
    jp: "浮動小数点形式で表現された数値の演算結果における丸め誤差の説明はどれか。",
    romaji: "Fudou shousuuten keishiki de hyougen sareta suuchi no enzan kekka ni okeru marume gosa no setsumei wa dore ka.",
    en: "Which is the description of rounding error in the result of arithmetic on numbers shown in floating-point form?",
    options: [
      { jp: "演算結果がコンピュータの扱える最大値を超えることによって生じる誤差である。", romaji: "Enzan kekka ga konpyuuta no atsukaeru saidaichi o koeru koto ni yotte shoujiru gosa de aru.", en: "An error that happens because the result goes over the largest value the computer can handle." },
      { jp: "数表現のけた数に限度があるので，最下位けたより小さい部分について四捨五入や切上げ，切捨てを行うことによって生じる誤差である。", romaji: "Suu hyougen no ketasuu ni gendo ga aru node, saikai keta yori chiisai bubun ni tsuite shishagonyuu ya kiriage, kirisute o okonau koto ni yotte shoujiru gosa de aru.", en: "An error that happens because the number of digits is limited, so the part below the lowest digit is rounded, rounded up, or cut off." },
      { jp: "乗除算において，指数部が小さい方の数値の仮数部の下位部分が失われることによって生じる誤差である。", romaji: "Joujozan ni oite, shisuubu ga chiisai hou no suuchi no kasuubu no kai bubun ga ushinawareru koto ni yotte shoujiru gosa de aru.", en: "An error that happens in multiply/divide when the low part of the mantissa of the number with the smaller exponent is lost." },
      { jp: "絶対値がほぼ等しい数値の加減算において，上位の有効数字が失われることによって生じる誤差である。", romaji: "Zettaichi ga hobo hitoshii suuchi no kagenzan ni oite, joui no yuukou suuji ga ushinawareru koto ni yotte shoujiru gosa de aru.", en: "An error that happens in add/subtract of numbers with almost equal absolute value, when the top significant digits are lost." },
    ],
    correctAnswer: 1, // イ
    imagePath: null,
    explanation: `ELI5:
Imagine you have a ruler that can only measure up to 3 decimal places. If you measure something that is actually 1.23456789 cm, you have to cut it off at 1.234 or round it to 1.235. That tiny difference between the real value and what you wrote down is a rounding error. Computers have the same problem. They can only store a limited number of digits, so any number that needs more digits than the computer can hold gets rounded off at the end. That leftover difference is the rounding error.
Now think about the wrong options. Option ア is about a completely different problem called overflow, which is when a number gets too big, not when digits get cut off. Option ウ is about cancellation in multiplication and division where digits are lost during alignment of exponents, which is called loss of trailing digits, not rounding error. Option エ is about a different problem called catastrophic cancellation, which happens when two nearly equal numbers are subtracted and the significant digits wipe each other out.

Technical breakdown:
In floating-point representation, numbers are stored as a mantissa and an exponent with a fixed number of bits. Because the number of bits is finite, any value that requires more precision than the format allows must be approximated. The approximation is done by rounding, rounding up, or truncating the digits below the least significant bit of the mantissa. The difference between the true mathematical value and the stored approximation is the rounding error. This is inherent to the floating-point format itself and occurs even in simple operations like storing 0.1 in binary.
Option ア describes overflow error, which occurs when a result exceeds the maximum representable value, for example when multiplying two very large numbers. This is a different category of floating-point error entirely.
Option ウ describes loss of trailing digits, which occurs during multiplication or division when the mantissa of a number with a smaller exponent is shifted and its lower bits fall outside the storable range. This is sometimes called truncation during alignment, not rounding error.
Option エ describes catastrophic cancellation or cancellation error, which occurs during subtraction of two nearly equal values. The significant digits cancel each other out, leaving only the low-order digits which are already noisy from prior rounding. The result has very few meaningful significant digits. This is a consequence of rounding error but is itself a distinct named error type.

Wrong answer analysis:
ア — This describes overflow error, not rounding error. Overflow happens when a computed result is too large for the format to store at all, causing the value to wrap around or become infinity. Rounding error happens at the digit level during normal storage of any value, regardless of its magnitude. These are different failure modes.
ウ — This describes loss of trailing digits during exponent alignment in multiplication or division. When two floating-point numbers with different exponents are multiplied, the smaller number's mantissa must be shifted, and its lower bits are discarded. This is a form of precision loss but it is not the definition of rounding error. Rounding error specifically refers to the approximation made when a value cannot be represented exactly within the available digits.
エ — This describes catastrophic cancellation. When two nearly equal numbers are subtracted, their leading digits cancel, and the result is dominated by the low-order digits that were already corrupted by rounding in earlier steps. This is a serious numerical problem but it is a downstream consequence of rounding, not rounding error itself. The exam is testing whether you know the precise definition of each named error type.

Correct answer: イ`,
  },
  {
    id: 3,
    number: "問3",
    jp: "図の木構造は2分探索木である。a〜gの値の大小関係として，適切なものはどれか。ここで，a〜gの値は重複しないものとする。",
    romaji: "Zu no ki kouzou wa nibun tansaku ki de aru. a kara g no atai no daishou kankei to shite, tekisetsu na mono wa dore ka. Koko de, a kara g no atai wa juufuku shinai mono to suru.",
    en: "The tree in the figure is a binary search tree. Which size order of the values a–g is correct? Here, the values a–g are all different.",
    options: [
      { jp: "a < b < d < e < c < f < g", romaji: "a < b < d < e < c < f < g", en: "a < b < d < e < c < f < g" },
      { jp: "d < b < e < a < f < c < g", romaji: "d < b < e < a < f < c < g", en: "d < b < e < a < f < c < g" },
      { jp: "d < e < f < g < b < c < a", romaji: "d < e < f < g < b < c < a", en: "d < e < f < g < b < c < a" },
      { jp: "g < f < c < e < d < b < a", romaji: "g < f < c < e < d < b < a", en: "g < f < c < e < d < b < a" },
    ],
    correctAnswer: 1, // イ
    imagePath: "public/questions/fe-2025-a/q03.png",
    explanation: `ELI5:
A binary search tree has one strict rule: for any node, every value in its left subtree is smaller than it, and every value in its right subtree is larger than it. This rule applies to every single node in the tree, not just the root.
Look at the tree. Node a is the root. Node b is to the left of a, so b is smaller than a. Node c is to the right of a, so c is larger than a. Node d is to the left of b, so d is smaller than b. Node e is to the right of b, so e is larger than b but still smaller than a because e is in the left subtree of a. Node f is to the left of c, so f is larger than a but smaller than c. Node g is to the right of c, so g is larger than c.
Putting it all together in order from smallest to largest: d, b, e, a, f, c, g. That matches option イ exactly.

Technical breakdown:
The binary search tree (BST) property states that for any node N, all values in the left subtree of N are less than N, and all values in the right subtree of N are greater than N. This property must hold recursively for every node, not just the root.

Applying the BST property to each node in the tree:

Node a (root): left subtree contains b, d, e so all of b, d, e are less than a. Right subtree contains c, f, g so all of c, f, g are greater than a. This gives us: d, b, e < a < f, c, g.

Node b (left child of a): left child is d so d is less than b. Right child is e so e is greater than b. This gives us: d < b < e.

Node c (right child of a): left child is f so f is less than c. Right child is g so g is greater than c. This gives us: f < c < g.

Combining all relationships in order: d < b < e < a < f < c < g. This is exactly option イ.

In-order traversal of a BST always visits nodes in ascending order. Performing in-order traversal on this tree visits: d, b, e, a, f, c, g. This confirms option イ.

Wrong answer analysis:
ア — This option gives a < b, meaning b is greater than a. But b is the left child of a, so b must be less than a by the BST property. This violates the fundamental rule at the very first comparison.
ウ — This option places all of d, e, f, g below both b and c, and then places b and c below a. This would only be valid if the entire right subtree of b and the entire left and right subtrees of c were all smaller than b, which directly contradicts the BST property for node c. Also e is the right child of b so e must be greater than b, not less.
エ — This option gives a descending order from g down to a, meaning a is the largest value. But a is the root with both left and right subtrees, so a cannot be the largest. The largest value in a BST is always the rightmost node, which is g in this tree. This option has the entire order reversed.

Correct answer: イ`,
  },
  {
    id: 4,
    number: "問4",
    jp: "MTBFは4,000時間，MTTRは1,000時間の装置がある。今後の6年間は，予防保守によってMTBFを前年に比べて毎年100時間ずつ改善し，遠隔保守によってMTTRを前年に比べて毎年100時間ずつ改善していく計画である。6年経過後の稼働率は幾らか。",
    romaji: "MTBF wa 4,000 jikan, MTTR wa 1,000 jikan no souchi ga aru. Kongo no roku-nenkan wa, yobou hoshu ni yotte MTBF o zennen ni kurabete maitoshi 100 jikan zutsu kaizen shi, enkaku hoshu ni yotte MTTR o zennen ni kurabete maitoshi 100 jikan zutsu kaizen shite iku keikaku de aru. Roku-nen keika go no kadou ritsu wa ikura ka.",
    en: "A device has an MTBF of 4,000 hours and an MTTR of 1,000 hours. Over the next 6 years, the plan is to improve MTBF by 100 hours each year and improve MTTR by 100 hours each year. What is the availability after 6 years?",
    options: [
      { jp: "0.88", romaji: "0.88", en: "0.88" },
      { jp: "0.90", romaji: "0.90", en: "0.90" },
      { jp: "0.92", romaji: "0.92", en: "0.92" },
      { jp: "0.94", romaji: "0.94", en: "0.94" },
    ],
    correctAnswer: 2, // ウ
    imagePath: null,
    explanation: `ELI5:
Imagine a machine that breaks down every 4,000 hours on average, and when it breaks it takes 1,000 hours to fix. The availability is how much of the total time the machine is actually working. Right now that is 4,000 divided by 4,000 plus 1,000, which equals 0.80 or 80 percent of the time.
Now every year for 6 years, the engineers get better at preventing breakdowns so the machine lasts 100 hours longer before breaking. They also get better at fixing it remotely so it takes 100 hours less to repair each year.
After 6 years the machine now breaks down every 4,600 hours on average and takes only 400 hours to fix. So the new availability is 4,600 divided by 4,600 plus 400, which equals 4,600 divided by 5,000, which equals 0.92.

Technical breakdown:
Availability is calculated using the formula: Availability = MTBF divided by (MTBF + MTTR).

Starting values:
MTBF = 4,000 hours
MTTR = 1,000 hours
Starting availability = 4,000 divided by (4,000 + 1,000) = 4,000 divided by 5,000 = 0.80

After 6 years of improvement:
MTBF increases by 100 hours per year for 6 years: 4,000 + (100 x 6) = 4,000 + 600 = 4,600 hours
MTTR decreases by 100 hours per year for 6 years: 1,000 - (100 x 6) = 1,000 - 600 = 400 hours

Availability after 6 years:
4,600 divided by (4,600 + 400) = 4,600 divided by 5,000 = 0.92

This matches option ウ.

One important check: MTTR decreasing by 100 hours per year for 6 years gives 1,000 - 600 = 400 hours. This is still a positive value so the calculation is valid. If MTTR had reached zero or gone negative that would signal an error in the problem setup, but 400 hours is reasonable.

Wrong answer analysis:
ア (0.88) — This would require a different combination of MTBF and MTTR values. For example 4,400 divided by 5,000 gives 0.88. This could result from only applying 4 years of MTBF improvement while keeping MTTR unchanged, or from misreading the improvement as applying to only one of the two values. It does not match 6 full years of improvement to both values.
イ (0.90) — This would give 4,500 divided by 5,000. This could result from applying 5 years of improvement instead of 6, or from improving only MTBF by 600 hours while not reducing MTTR at all, giving 4,600 divided by (4,600 + 1,000) which is approximately 0.82, which does not match either. The most likely error producing 0.90 is miscounting the number of years of improvement.
エ (0.94) — This would require 4,700 divided by 5,000. This could result from applying 7 years of improvement instead of 6, or from doubling the annual improvement rate. Neither matches the problem statement. This is a trap for students who miscount or misread the improvement rate.

Correct answer: ウ`,
  },
  {
    id: 5,
    number: "問5",
    jp: "ローコード開発ツールを用いたソフトウェア開発の説明はどれか。",
    romaji: "Roo koodo kaihatsu tsuuru o mochiita sofutowea kaihatsu no setsumei wa dore ka.",
    en: "Which is the description of software development using a low-code development tool?",
    options: [
      { jp: "アプリケーションソフトウェアの開発基盤の上で，用意された部品やテンプレートをGUIを用いた操作で組み合わせたり，必要に応じて一部の処理のソースコードを記述したりすることによって，アプリケーションソフトウェアを作成する。", romaji: "Apurikeeshon sofutowea no kaihatsu kiban no ue de, youi sareta buhin ya tenpureeto o GUI o mochiita sousa de kumiawasetari, hitsuyou ni oujite ichibu no shori no soosu koodo o kijutsu shitari suru koto ni yotte, apurikeeshon sofutowea o sakusei suru.", en: "On a development platform, you build the app by combining ready parts and templates through GUI operations, and writing source code for some processing only when needed." },
      { jp: "アプリケーションソフトウェアの開発基盤の上で，用意された部品やテンプレートをGUIを用いた操作で組み合わせるだけで，ソースコードを記述せずに，アプリケーションソフトウェアを作成する。", romaji: "Apurikeeshon sofutowea no kaihatsu kiban no ue de, youi sareta buhin ya tenpureeto o GUI o mochiita sousa de kumiawaseru dake de, soosu koodo o kijutsu sezu ni, apurikeeshon sofutowea o sakusei suru.", en: "On a development platform, you build the app only by combining ready parts and templates through GUI operations, writing no source code at all." },
      { jp: "アプリケーションソフトウェアの定型的な枠組みを参照して，独自の処理のソースコードを記述することによって，アプリケーションソフトウェアを作成する。", romaji: "Apurikeeshon sofutowea no teikei teki na wakugumi o sanshou shite, dokuji no shori no soosu koodo o kijutsu suru koto ni yotte, apurikeeshon sofutowea o sakusei suru.", en: "You build the app by referring to a fixed framework and writing your own source code for the processing." },
      { jp: "利用者がシステムを利用して行う作業を自動化ツールに代行させるために，利用者によるシステムの操作手順をツールに登録する。", romaji: "Riyousha ga shisutemu o riyou shite okonau sagyou o jidouka tsuuru ni daikou saseru tame ni, riyousha ni yoru shisutemu no sousa tejun o tsuuru ni touroku suru.", en: "To let an automation tool do the work a user does on a system, you register the user's operation steps into the tool." },
    ],
    correctAnswer: 0, // ア
    imagePath: null,
    explanation: `ELI5:
Imagine building with LEGO. Low-code development is like building mostly with ready-made LEGO sets where the big pieces are already shaped for you. You snap them together using a visual interface, and occasionally you write a small custom piece when the pre-made ones do not quite fit what you need. You do not build every brick from scratch, but you are not completely forbidden from touching the raw materials either.
Now look at the wrong options. Option イ describes no-code development, not low-code. No-code means you never write a single line of code at all, only drag and drop. Low-code allows some code writing when needed. Option ウ describes traditional framework-based development where you write most of the code yourself and just follow a structural template. Option エ describes RPA, which is Robotic Process Automation, where you record mouse clicks and keyboard actions to automate repetitive tasks. That has nothing to do with building application software.

Technical breakdown:
Low-code development platforms provide a visual development environment with pre-built components, templates, and drag-and-drop GUI tools that allow developers to build applications with minimal hand-written code. The key characteristic of low-code is that it allows but does not require writing source code. Developers can extend or customize behavior by writing code for specific processes when the visual tools are insufficient. This is what separates low-code from no-code.

The four options in this question map to four distinct development approaches:

Option ア describes low-code development. GUI-based component assembly is the primary method, with optional source code writing for specific processes. This is the correct definition.

Option イ describes no-code development. The phrase without writing any source code is the critical difference. No-code platforms are more restrictive because they offer no escape hatch into manual coding. They are designed for non-developers who cannot write code at all.

Option ウ describes framework-based traditional development. A framework such as Spring or Django provides a standard structure, and the developer writes custom source code to fill in the logic. This is conventional software engineering, not low-code.

Option エ describes RPA, Robotic Process Automation. Tools like UiPath or Power Automate record and replay user interactions with existing systems. The focus is on automating existing workflows, not on building new application software.

Wrong answer analysis:
イ — This is the most dangerous trap in this question because it sounds almost identical to ア. The single difference is the phrase without writing any source code. Low-code allows optional code writing. No-code does not. If you miss that one phrase you will pick イ and get it wrong. The exam is specifically testing whether you know this distinction.
ウ — This describes framework-based development, which is closer to traditional coding than low-code. The key signal is the phrase write source code for unique processes with reference to a standard framework. In low-code, writing code is optional and secondary. In framework-based development, writing code is the primary activity.
エ — This describes RPA. The key signals are the phrases tasks that users carry out and register the user's system operation procedures. RPA automates human interactions with existing software. Low-code builds new software. These are completely different categories of tools.

Correct answer: ア`,
  },
  {
    id: 6,
    number: "問6",
    jp: "“商品”表に対するSQL文「SELECT * FROM 商品 WHERE 仕入先ID IN ('M002', 'M004')」と同じ結果が得られるSELECT文はどれか。",
    romaji: "“Shouhin” hyou ni taisuru SQL bun “SELECT * FROM 商品 WHERE 仕入先ID IN ('M002', 'M004')” to onaji kekka ga erareru SELECT bun wa dore ka.",
    en: "For the '商品' (Product) table, which SELECT statement gives the same result as: SELECT * FROM Product WHERE SupplierID IN ('M002', 'M004')?",
    options: [
      { jp: "SELECT * FROM 商品 WHERE 仕入先ID = 'M002' AND 仕入先ID = 'M004'", romaji: "SELECT * FROM 商品 WHERE 仕入先ID = 'M002' AND 仕入先ID = 'M004'", en: "SELECT * FROM Product WHERE SupplierID = 'M002' AND SupplierID = 'M004'" },
      { jp: "SELECT * FROM 商品 WHERE 仕入先ID = 'M002' INTERSECT SELECT * FROM 商品 WHERE 仕入先ID = 'M004'", romaji: "SELECT * FROM 商品 WHERE 仕入先ID = 'M002' INTERSECT SELECT * FROM 商品 WHERE 仕入先ID = 'M004'", en: "SELECT * FROM Product WHERE SupplierID = 'M002' INTERSECT SELECT * FROM Product WHERE SupplierID = 'M004'" },
      { jp: "SELECT * FROM 商品 WHERE 仕入先ID = 'M002' OR 仕入先ID = 'M004'", romaji: "SELECT * FROM 商品 WHERE 仕入先ID = 'M002' OR 仕入先ID = 'M004'", en: "SELECT * FROM Product WHERE SupplierID = 'M002' OR SupplierID = 'M004'" },
      { jp: "SELECT * FROM 商品 WHERE 仕入先ID BETWEEN 'M002' AND 'M004'", romaji: "SELECT * FROM 商品 WHERE 仕入先ID BETWEEN 'M002' AND 'M004'", en: "SELECT * FROM Product WHERE SupplierID BETWEEN 'M002' AND 'M004'" },
    ],
    correctAnswer: 2, // ウ
    imagePath: null,
    explanation: `ELI5:
Imagine you are looking through a list of products and you want to find everything supplied by either supplier M002 or supplier M004. The IN keyword is like saying: show me every row where the supplier ID matches any value in this list. It is an OR across all the values in the list.
Option ウ does exactly the same thing but written out longhand. Instead of IN with a list, it says supplier ID equals M002 OR supplier ID equals M004. These two ways of writing it produce identical results.
Option ア uses AND instead of OR. A single row cannot have a supplier ID that is simultaneously M002 and M004, so AND will always return zero rows. This is a very common beginner mistake.
Option イ uses INTERSECT, which finds rows that appear in both result sets. But no row can belong to both M002 and M004 at the same time, so INTERSECT also returns zero rows.
Option エ uses BETWEEN, which in SQL for text values finds everything alphabetically between M002 and M004 inclusive. That would also include M003, which is not in the original IN list. So エ returns too many rows.

Technical breakdown:
The original SQL uses the IN operator: WHERE 仕入先ID IN ('M002', 'M004'). The IN operator checks whether the column value matches any value in the provided list. It is logically equivalent to a chain of OR conditions: WHERE 仕入先ID = 'M002' OR 仕入先ID = 'M004'.

Applying the original SQL to the table:
S002 | 食器洗い機 | M002 matches
S005 | コーヒーメーカー | M004 matches
S006 | ホットプレート | M004 matches
Result: 3 rows returned.

Option ア uses AND: WHERE 仕入先ID = 'M002' AND 仕入先ID = 'M004'
A single column cannot hold two values simultaneously. This condition is always false for every row. Result: 0 rows returned. This does not match.

Option イ uses INTERSECT: SELECT where M002 INTERSECT SELECT where M004
INTERSECT returns only rows that appear in both result sets. The first SELECT returns S002. The second SELECT returns S005 and S006. These two sets share no rows in common. Result: 0 rows returned. This does not match.

Option ウ uses OR: WHERE 仕入先ID = 'M002' OR 仕入先ID = 'M004'
This returns every row where supplier ID is M002 or M004. Result: S002, S005, S006 are returned. This matches the original IN query exactly.

Option エ uses BETWEEN: WHERE 仕入先ID BETWEEN 'M002' AND 'M004'
BETWEEN for string values uses alphabetical ordering and is inclusive on both ends. M002 and M004 are included but so is M003. Result: S002, S003, S004, S005, S006 are returned. This returns 5 rows instead of 3 and does not match.

Wrong answer analysis:
ア — AND is the single most common mistake in this type of question. Students who are not careful read the IN list and think both values must be satisfied. But AND requires both conditions to be true for the same row simultaneously. A supplier ID cannot be both M002 and M004 at the same time, so AND always produces zero rows here. IN means either value, which is OR logic not AND logic.
イ — INTERSECT is a set operation that returns the common rows between two result sets. Students might think INTERSECT means combining the two sets, but that is UNION not INTERSECT. Since no product row can have both M002 and M004 as its supplier, the two result sets have no rows in common and INTERSECT returns nothing.
エ — BETWEEN looks plausible because M002 and M004 are the boundary values in the IN list. The trap is that BETWEEN is inclusive and continuous. It includes every value between M002 and M004 alphabetically, which includes M003. The original query only wants M002 and M004 specifically, not everything in between.

Correct answer: ウ`,
  },
  {
    id: 7,
    number: "問7",
    jp: "1Gバイトの動画データを40Mビット／秒の回線を使用してダウンロードしたところ，5分掛かった。このときの回線利用率はおよそ何％か。ここで，ダウンロード時には動画データに20％の制御情報が付加されるものとする。",
    romaji: "1 Gbaito no douga deeta o 40 Mbitto / byou no kaisen o shiyou shite daunroodo shita tokoro, go-fun kakatta. Kono toki no kaisen riyou ritsu wa oyoso nan paasento ka. Koko de, daunroodo ji ni wa douga deeta ni 20 paasento no seigyo jouhou ga fuka sareru mono to suru.",
    en: "Downloading 1 GB of video data over a 40 Mbit/s line took 5 minutes. About what percent is the line utilization? Here, 20% control information is added to the video data during download.",
    options: [
      { jp: "10", romaji: "10", en: "10" },
      { jp: "53", romaji: "53", en: "53" },
      { jp: "67", romaji: "67", en: "67" },
      { jp: "80", romaji: "80", en: "80" },
    ],
    correctAnswer: 3, // エ
    imagePath: null,
    explanation: `ELI5:
Imagine a highway that can carry 40 cars per second. You need to move 1,000 cars and it takes 5 minutes. But there is a catch: for every 5 cars of actual cargo, you also need 1 extra car just to carry the paperwork and instructions. So the total number of cars you actually sent is 1,200, not 1,000.
Now the question is: out of everything the highway could have carried in those 5 minutes, what percentage did you actually use? The highway could carry 40 cars per second times 300 seconds which is 12,000 cars total. You used 1,200 cars. So the utilization is 1,200 divided by 12,000 which is 10 percent.
Wait, that gives option ア. But the question asks for the line utilization rate, which means how much of the available bandwidth was actually used during the time the data was being sent. The actual data including control information took a certain amount of time to transmit at the full line speed. Let us work through the real calculation carefully.

Technical breakdown:
Step 1: Convert all units to the same base.
Video data size = 1 GB = 1 x 8 Gbits = 8,000 Mbits (using 1 GB = 1,000 MB = 1,000 x 8 Mbits)
Note: In networking contexts on Japanese IT exams, 1 GB is treated as 1,000 MB and 1 MB as 1,000 KB unless stated otherwise. Use 1 GB = 8,000 Mbits.

Step 2: Calculate total data transmitted including control information.
Control information = 20 percent of video data = 8,000 x 0.20 = 1,600 Mbits
Total data transmitted = 8,000 + 1,600 = 9,600 Mbits

Step 3: Calculate total time available.
5 minutes = 5 x 60 = 300 seconds
Line capacity = 40 Mbits per second
Total capacity = 40 x 300 = 12,000 Mbits

Step 4: Calculate line utilization rate.
Line utilization = total data transmitted divided by total capacity
Line utilization = 9,600 divided by 12,000 = 0.80 = 80 percent

This matches option エ.

Step 5: Verify the result makes sense.
The line transmitted 9,600 Mbits out of a possible 12,000 Mbits in 300 seconds. The remaining 2,400 Mbits of capacity went unused. 80 percent utilization is a reasonable and realistic figure for a busy download.

Wrong answer analysis:
ア (10%) — This is the result of dividing only the video data without control information by the total capacity, and also forgetting to convert GB to Mbits correctly. Specifically if someone uses 1,200 Mbits divided by 12,000 Mbits they get 10 percent. This error comes from converting 1 GB as 1,200 MB instead of 8,000 Mbits and not applying the 20 percent overhead. Multiple unit conversion errors stack up to produce this wrong answer.
イ (53%) — This result comes from a unit conversion error where the student converts 1 GB to bits incorrectly, for example treating 1 GB as 1,024 MB and then computing with mixed units. Alternatively it can come from dividing the total data in bytes by the line speed in bits without converting, giving roughly 9,600 MB divided by 18,000 MB equivalent which approximates to around 53 percent. This is a classic mixed-unit trap.
ウ (67%) — This result comes from forgetting to add the 20 percent control information overhead and dividing only the raw video data by the total capacity. 8,000 Mbits divided by 12,000 Mbits equals 0.667 which rounds to approximately 67 percent. This is the trap for students who read the problem carefully enough to convert units correctly but miss the control information addition step.

Correct answer: エ`,
  },
  {
    id: 8,
    number: "問8",
    jp: "HTTPとHTTPSを比較した場合において，HTTPSだけがもつ特徴を示したものはどれか。",
    romaji: "HTTP to HTTPS o hikaku shita baai ni oite, HTTPS dake ga motsu tokuchou o shimeshita mono wa dore ka.",
    en: "Comparing HTTP and HTTPS, which shows a feature that only HTTPS has?",
    options: [
      { jp: "cookieに保存されている情報を用いたセッション管理が可能である。", romaji: "cookie ni hozon sarete iru jouhou o mochiita sesshon kanri ga kanou de aru.", en: "Session management using information saved in cookies is possible." },
      { jp: "IDとパスワードによって利用者の認証を行うことが可能である。", romaji: "ID to pasuwaado ni yotte riyousha no ninshou o okonau koto ga kanou de aru.", en: "Authenticating users with an ID and password is possible." },
      { jp: "Webブラウザでキャッシュさせることによって通信量を減らすことが可能である。", romaji: "Web burauza de kyasshu saseru koto ni yotte tsuushinryou o herasu koto ga kanou de aru.", en: "Reducing traffic by letting the web browser cache is possible." },
      { jp: "通信相手先サーバをサーバ証明書によって確認することが可能である。", romaji: "Tsuushin aitesaki saaba o saaba shoumeisho ni yotte kakunin suru koto ga kanou de aru.", en: "Checking the server you are communicating with by its server certificate is possible." },
    ],
    correctAnswer: 3, // エ
    imagePath: null,
    explanation: `ELI5:
Imagine you are sending a letter through the post. HTTP is like sending a postcard where anyone who handles it can read what is written on it. HTTPS is like sending the same letter in a sealed envelope with a verified return address stamp that proves it actually came from the sender it claims to be from. The sealed envelope means nobody in the middle can read or tamper with the contents. The verified stamp means you can confirm the letter genuinely came from the bank or the shop you think you are dealing with and not from someone pretending to be them.
Now look at the wrong options. Cookie-based session management works in both HTTP and HTTPS, so that is not unique to HTTPS. ID and password authentication also works in both HTTP and HTTPS since it is just sending text, the difference is whether that text is encrypted in transit or not. Browser caching also works in both protocols. The only thing HTTPS adds that HTTP cannot do is the ability to verify the server identity using a certificate and encrypt the communication channel.

Technical breakdown:
HTTPS is HTTP with TLS (Transport Layer Security) layered on top. TLS provides three things: encryption of data in transit, integrity checking to detect tampering, and server authentication via digital certificates. The question asks specifically what HTTPS has that HTTP does not. The answer is server authentication via a server certificate.

When a client connects to an HTTPS server, the server presents a digital certificate issued by a trusted Certificate Authority (CA). The certificate contains the server's public key and is signed by the CA. The client verifies the signature using the CA's public key, which it already trusts. If verification passes, the client knows it is communicating with the legitimate server and not an impersonator. This process is called certificate-based server authentication and it is unique to HTTPS.

Now evaluating each option against both HTTP and HTTPS:

Option ア: Cookie-based session management. Cookies are an application-layer mechanism supported by both HTTP and HTTPS. The Set-Cookie header works identically in both protocols. HTTPS adds the Secure flag option to prevent cookies from being sent over plain HTTP, but the session management mechanism itself is not unique to HTTPS.

Option イ: ID and password authentication. This is simply sending credentials as text in a request. It works in both HTTP and HTTPS. The difference is that over HTTP the credentials travel in plaintext and can be intercepted, while over HTTPS they are encrypted. But the authentication mechanism itself is not exclusive to HTTPS.

Option ウ: Browser caching. Cache-Control and related headers work identically in HTTP and HTTPS. The protocol layer has no bearing on whether a browser caches a response. This is not unique to HTTPS.

Option エ: Server certificate verification. A server certificate is only meaningful in the context of TLS, which only exists in HTTPS. HTTP has no handshake, no certificate exchange, and no mechanism to verify the identity of the server. This is the only feature in the list that belongs exclusively to HTTPS.

Wrong answer analysis:
ア — Cookie-based session management is a feature of the HTTP application layer itself, not of the security layer added by HTTPS. Both protocols use the same Set-Cookie and Cookie headers for session tracking. The Secure cookie attribute is HTTPS-related but that is a cookie property, not a capability of the protocol itself. This option is wrong because the capability exists in both protocols.
イ — ID and password authentication is a method of sending credentials, which works over any protocol that can carry HTTP requests. HTTPS makes this safer by encrypting the credentials in transit, but the authentication mechanism itself is not introduced by HTTPS. A server running plain HTTP can absolutely require a username and password login. This option confuses security improvement with exclusive capability.
ウ — Browser caching is controlled entirely by HTTP headers such as Cache-Control, Expires, and ETag. These headers work identically whether the connection is HTTP or HTTPS. The transport security layer has no effect on caching behavior. This option is wrong because caching predates HTTPS and operates independently of it.

Correct answer: エ`,
  },
  {
    id: 9,
    number: "問9",
    jp: "暗号の危殆化に該当するものはどれか。",
    romaji: "Angou no kitaika ni gaitou suru mono wa dore ka.",
    en: "Which one is a case of cryptographic compromise (weakening of encryption)?",
    options: [
      { jp: "あるCAでデジタル証明書の署名に使っている公開鍵のデジタル証明書の有効期限が切れた。", romaji: "Aru CA de dejitaru shoumeisho no shomei ni tsukatte iru koukai kagi no dejitaru shoumeisho no yuukou kigen ga kireta.", en: "At a CA, the digital certificate of the public key used to sign certificates passed its expiry date." },
      { jp: "ある暗号アルゴリズムの秘密鍵が不正アクセスによって漏えいした。", romaji: "Aru angou arugorizumu no himitsu kagi ga fusei akusesu ni yotte rouei shita.", en: "A secret key of an encryption algorithm leaked due to unauthorized access." },
      { jp: "あるハッシュ関数においてハッシュ値が同じになるデータの組を現実的な時間内で発見する方法が見つかった。", romaji: "Aru hasshu kansuu ni oite hasshu chi ga onaji ni naru deeta no kumi o genjitsu teki na jikan nai de hakken suru houhou ga mitsukatta.", en: "A way was found to discover, in realistic time, a pair of data that produces the same hash value in a hash function." },
      { jp: "あるランサムウェアの一種で暗号化されたファイルの復号鍵が公開された。", romaji: "Aru ransamuwea no isshu de angouka sareta fairu no fukugou kagi ga koukai sareta.", en: "The decryption key for files encrypted by a kind of ransomware was made public." },
    ],
    correctAnswer: 2, // ウ
    imagePath: null,
    explanation: `ELI5:
Imagine you have a very strong safe that everyone agreed was impossible to break into. Over time, a thief figures out a method to crack it open in a realistic amount of time. The safe has not been physically broken yet, but the method to break it now exists. This means the safe can no longer be trusted, even if no one has actually used the method to steal anything yet. That is cryptographic compromise. The algorithm or key is not broken yet in practice, but a realistic attack path has been discovered that makes it untrustworthy going forward.
Now look at the wrong options. Option ア is about a certificate expiring, which is a normal scheduled event and not a security compromise. Option イ is about a secret key being stolen through unauthorized access, which is a key leakage incident, not cryptographic compromise. The algorithm itself is still strong. Option エ is about a decryption key for ransomware being published, which is actually good news for victims. None of these involve the underlying algorithm or hash function becoming mathematically weakened.

Technical breakdown:
Cryptographic compromise, known in Japanese as kigou no kitaika, refers to the situation where a cryptographic algorithm, hash function, or key length that was previously considered secure becomes untrustworthy due to advances in attack techniques, increases in computing power, or the discovery of mathematical weaknesses. The key characteristic is that the weakness is in the algorithm or cryptographic primitive itself, not in how it was implemented or managed.

Option ア: A CA's public key certificate expiring. Certificate expiry is a planned administrative event. It does not indicate any weakness in the cryptographic algorithm. The same algorithm continues to be used after renewal. This is certificate lifecycle management, not cryptographic compromise.

Option イ: A secret key being leaked through unauthorized access. This is a key compromise incident, not a cryptographic compromise. The distinction is critical. In key compromise, the algorithm is still mathematically sound. The problem is that the specific key material was stolen. The solution is to revoke and replace the key. In cryptographic compromise, even generating a new key using the same algorithm does not solve the problem because the algorithm itself is broken.

Option ウ: A method being found to discover a collision in a hash function within a realistic amount of time. A collision means two different inputs produce the same hash output. If this can be done in realistic time, the hash function can no longer be trusted for integrity verification or digital signatures because an attacker could substitute a malicious input that produces the same hash as the legitimate one. This is a mathematical weakness in the algorithm itself discovered through cryptanalysis. This is the definition of cryptographic compromise.

Option エ: A decryption key for a type of ransomware being made public. This is the opposite of a security problem for victims. It means encrypted files can be recovered. The ransomware's encryption algorithm has not been mathematically broken. Someone simply obtained or released the specific key. This is key disclosure, not cryptographic compromise.

Wrong answer analysis:
ア — Certificate expiry is a routine event built into the PKI system by design. Certificates have validity periods to limit the damage if a key is compromised. Expiry itself is not a sign of weakness. The exam tests whether students understand that cryptographic compromise is about algorithmic weakness, not administrative events. A student who confuses certificate management with cryptographic security will pick this option.
イ — This is the most dangerous trap in this question because key leakage sounds like a serious security event, which it is, but it is not cryptographic compromise. The difference is the level at which the failure occurs. Key leakage is an operational security failure. Cryptographic compromise is a mathematical failure of the algorithm itself. A new key using the same algorithm fixes key leakage. A new key using the same algorithm does not fix cryptographic compromise.
エ — Students who do not read carefully might think that any event involving encryption and decryption keys relates to cryptographic compromise. But publishing a ransomware decryption key is a recovery event, not an attack. The ransomware algorithm has not been broken mathematically. This option is designed to trap students who pattern-match on the words encryption and key without thinking about what actually happened.

Correct answer: ウ`,
  },
  {
    id: 10,
    number: "問10",
    jp: "WAFの説明はどれか。",
    romaji: "WAF no setsumei wa dore ka.",
    en: "Which is the description of a WAF?",
    options: [
      { jp: "Webサイトに対するアクセス内容を監視し，攻撃とみなされるパターンを検知したときに当該アクセスを遮断する。", romaji: "Web saito ni taisuru akusesu naiyou o kanshi shi, kougeki to minasareru pataan o kenchi shita toki ni tougai akusesu o shadan suru.", en: "It watches the content of access to a website, and blocks that access when it detects a pattern seen as an attack." },
      { jp: "Wi-Fiアライアンスが認定した無線LANの暗号化方式の規格であり，AES暗号に対応している。", romaji: "Wi-Fi araiansu ga nintei shita musen LAN no angouka houshiki no kikaku de ari, AES angou ni taiou shite iru.", en: "It is a wireless LAN encryption standard certified by the Wi-Fi Alliance and supports AES encryption." },
      { jp: "様々なシステムの動作ログを一元的に蓄積，管理し，セキュリティ上の脅威となる事象をいち早く検知，分析する。", romaji: "Samazama na shisutemu no dousa rogu o ichigen teki ni chikuseki, kanri shi, sekyuriti jou no kyoui to naru jishou o ichihayaku kenchi, bunseki suru.", en: "It collects and manages operation logs from many systems in one place, and quickly detects and analyzes events that are security threats." },
      { jp: "ファイアウォール機能を有し，マルウェア対策機能，侵入検知機能などの複数のセキュリティ機能を連携させ，統合的に管理する。", romaji: "Faiawooru kinou o yuushi, maruwea taisaku kinou, shinnyuu kenchi kinou nado no fukusuu no sekyuriti kinou o renkei sase, tougou teki ni kanri suru.", en: "It has a firewall function and links several security functions such as anti-malware and intrusion detection, managing them together." },
    ],
    correctAnswer: 0, // ア
    imagePath: null,
    explanation: `ELI5:
Imagine your building has a security guard at the front door whose job is to check every person coming in and throw out anyone who looks like a troublemaker. WAF is exactly that but for websites. Every request coming into a website gets checked against a list of known attack patterns. If a request matches a dangerous pattern, the WAF blocks it before it ever reaches the actual web application.
Now look at the wrong options. Option イ is about Wi-Fi encryption standards, which is a wireless network security topic completely unrelated to web application protection. Option ウ is about collecting and analyzing logs from multiple systems to detect threats early, which describes a SIEM system. Option エ is about a device that combines firewall, antivirus, and intrusion detection into one unified system, which describes a UTM device. None of these three are WAF.

Technical breakdown:
WAF stands for Web Application Firewall. It operates at the application layer (Layer 7 of the OSI model) and inspects the content of HTTP and HTTPS requests and responses. Unlike a traditional network firewall which filters based on IP addresses and ports, a WAF understands web application traffic and can detect attack patterns specific to web applications such as SQL injection, cross-site scripting (XSS), and command injection.

The WAF maintains a ruleset of known attack signatures and behavioral patterns. When incoming traffic matches a malicious pattern, the WAF blocks the request and optionally logs the event for analysis. Some WAFs also support positive security models where only explicitly allowed request patterns are permitted.

Option ア describes WAF precisely: monitoring access content directed at a website, detecting patterns deemed to be attacks, and blocking the relevant access. This is the correct answer.

Option イ describes WPA, Wi-Fi Protected Access. Wi-Fi Alliance certification and AES encryption are the key signals here. WPA2 and WPA3 are wireless LAN encryption standards. This has no connection to web application security.

Option ウ describes SIEM, Security Information and Event Management. The key signals are collecting operation logs from multiple systems in a centralized manner and early detection and analysis of security threats. SIEM aggregates log data from across an entire IT environment and uses correlation rules and analytics to surface threats. It does not block individual web requests.

Option エ describes UTM, Unified Threat Management. The key signals are firewall functionality combined with malware countermeasures, intrusion detection, and integrated management of multiple security functions. UTM is a network security appliance that bundles multiple security tools. It operates at the network layer, not the web application layer.

Wrong answer analysis:
イ — The mention of Wi-Fi Alliance and AES encryption are immediate signals that this option is about wireless LAN security, not web application security. WAF has nothing to do with wireless protocols. A student who does not know what WAF stands for or confuses it with a general security term might scan the options and pick this one because it sounds technical and security-related.
ウ — SIEM is a legitimate and important security tool and this option is well-written enough to fool students who have surface-level security knowledge. The critical difference is that SIEM collects and analyzes logs after the fact to detect patterns across the whole environment. WAF intercepts and blocks individual requests in real time at the web application boundary. SIEM observes. WAF blocks.
エ — UTM is another legitimate security product and the description in this option is accurate for UTM. The trap is that UTM sounds comprehensive enough to include WAF functionality, and some UTM devices do include basic WAF features. However UTM is defined by its integration of multiple network-layer security functions into one appliance, not by web application layer inspection. The exam is testing whether students know the precise definition of WAF versus the broader category of UTM.

Correct answer: ア`,
  },
  {
    id: 11,
    number: "問11",
    jp: "E-Rモデルにおけるエンティティの特徴はどれか。",
    romaji: "E-R moderu ni okeru entiti no tokuchou wa dore ka.",
    en: "Which is a feature of an entity in an E-R model?",
    options: [
      { jp: "エンティティとインスタンスとは，1対1の対応関係をとる。", romaji: "Entiti to insutansu to wa, ichi tai ichi no taiou kankei o toru.", en: "An entity and an instance have a one-to-one relationship." },
      { jp: "エンティティとなり得るものは，物的に実現するものである。", romaji: "Entiti to nari uru mono wa, butsuteki ni jitsugen suru mono de aru.", en: "Things that can be an entity are things that physically exist." },
      { jp: "エンティティは，特性を表すための属性（アトリビュート）をもつ。", romaji: "Entiti wa, tokusei o arawasu tame no zokusei (atoribyuuto) o motsu.", en: "An entity has attributes that express its characteristics." },
      { jp: "異なった種類のエンティティ間の関係は，主として状態遷移として表現される。", romaji: "Kotonatta shurui no entiti kan no kankei wa, shu to shite joutai sen'i to shite hyougen sareru.", en: "Relationships between different kinds of entities are mainly shown as state transitions." },
    ],
    correctAnswer: 2, // ウ
    imagePath: null,
    explanation: `ELI5:
Imagine you are organizing a library. An entity is like a category of things you want to keep track of, for example books, members, and branches. Each category has its own characteristics. A book has a title, an author, and an ISBN. A member has a name and a membership number. These characteristics are called attributes. The key point is that an entity does not have to be a physical object. A loan, a reservation, or an event can all be entities too because they are things you need to track information about.
Now look at the wrong options. Option ア says entities and instances have a one to one relationship. That is wrong because one entity represents an entire category while instances are the individual members of that category. The entity Book corresponds to thousands of individual book instances. Option イ says entities must be physically real things. That is wrong because abstract concepts like a transaction or a contract are valid entities. Option エ says relationships between different entity types are expressed mainly as state transitions. That is wrong because relationships in ER models are expressed as associations or links between entities, not state transitions. State transitions belong to state machine diagrams, not ER models.

Technical breakdown:
The Entity-Relationship model, commonly called the ER model or E-R model, is a conceptual data modeling technique used to describe the structure of data in a system. It was introduced by Peter Chen in 1976 and remains the standard tool for database design.

The three core components of an ER model are entities, attributes, and relationships.

An entity represents a class or type of object about which data is stored. Examples include Customer, Product, Order, and Employee. An entity is the template or schema, not an individual record.

An instance is one specific occurrence of an entity. For example, the entity Customer might have instances such as customer number 1001 Tanaka, customer number 1002 Suzuki, and so on. The relationship between an entity and its instances is one to many, not one to one. One entity definition corresponds to potentially unlimited instances.

An attribute is a property or characteristic that describes an entity. The entity Customer might have attributes such as customer ID, name, address, and phone number. Attributes capture the data that needs to be stored for each instance of the entity. Option ウ states that entities have attributes, which is the correct and precise definition of an entity in the ER model.

Entities do not need to be physically tangible objects. Abstract concepts, events, and relationships can all be modeled as entities when there is data to store about them. A Reservation, a Transaction, a Contract, or a Meeting are all valid entities in an ER model.

Relationships in an ER model describe how entities are associated with each other. They are represented as named associations, often with cardinality notation such as one to one, one to many, or many to many. They are not expressed as state transitions.

Option ア: Entity and instance have a one to one relationship. This is incorrect. One entity type corresponds to many instances. The entity Employee does not map to a single employee record. It maps to all employee records in the system.

Option イ: Things that can be entities are only those that are physically realized. This is incorrect. ER modeling explicitly allows abstract entities. A Purchase Order, an Enrollment, or a Diagnosis are all valid entities despite having no physical form.

Option ウ: Entities have attributes that represent their characteristics. This is correct. Every entity in an ER model is described by a set of attributes that capture the relevant properties of that entity type.

Option エ: Relationships between different entity types are mainly expressed as state transitions. This is incorrect. State transitions belong to behavioral models such as state machine diagrams or statechart diagrams. ER models are structural models that show data relationships, not behavioral sequences.

Wrong answer analysis:
ア — The confusion between entity and instance is one of the most common conceptual errors in data modeling. An entity is the class definition. An instance is a specific record. Saying they have a one to one relationship suggests a misunderstanding of what an entity is. The entity Person does not disappear once one person is recorded. It is the template for every person record in the database.
イ — This option reflects an overly narrow interpretation of what can be modeled as an entity. Students who think of databases as storing records of physical things will be drawn to this option. The ER model is specifically designed to handle abstract concepts and events because real-world business data is full of them. A salary payment, a course enrollment, and a flight booking are all abstract but all require structured data storage.
エ — State transitions are a concept from behavioral modeling, specifically from UML state machine diagrams or from finite automaton theory. Mixing state transitions into an ER model description suggests a confusion between structural modeling and behavioral modeling. ER diagrams show what data exists and how it is related, not how the system changes over time in response to events.

Correct answer: ウ`,
  },
  {
    id: 12,
    number: "問12",
    jp: "オブジェクト指向プログラミングの特徴のうち，異なるクラスのオブジェクトを同一のインタフェースで操作したときに，操作対象クラスに応じた異なる動作を可能にすることを何と呼ぶか。",
    romaji: "Obujekuto shikou puroguramingu no tokuchou no uchi, kotonaru kurasu no obujekuto o douitsu no intafeesu de sousa shita toki ni, sousa taishou kurasu ni oujita kotonaru dousa o kanou ni suru koto o nan to yobu ka.",
    en: "In object-oriented programming, what is it called when objects of different classes are operated through the same interface and behave differently depending on the target class?",
    options: [
      { jp: "委譲", romaji: "Ijou", en: "Delegation" },
      { jp: "継承", romaji: "Keishou", en: "Inheritance" },
      { jp: "コンポジション", romaji: "Konpojishon", en: "Composition" },
      { jp: "多相性", romaji: "Tasousei", en: "Polymorphism" },
    ],
    correctAnswer: 3, // エ
    imagePath: null,
    explanation: `ELI5:
Imagine you have three different types of vending machines: one sells drinks, one sells snacks, and one sells sandwiches. Each machine has a different button layout but they all have one thing in common: you press a button and something comes out. Polymorphism is like having one universal remote control that has a single button called dispense. When you point it at the drinks machine and press dispense, you get a drink. When you point it at the snacks machine and press dispense, you get a snack. Same button, same interface, but different behavior depending on which machine you are pointing at. You do not need a different remote for each machine. One interface, multiple behaviors.
Now look at the wrong options. Option ア is delegation, which is when an object hands off a task to another object instead of doing it itself. Option イ is inheritance, which is when one class acquires the properties and methods of another class. Option ウ is composition, which is when a class is built by combining other classes as components rather than inheriting from them. None of these describe the concept of one interface producing different behaviors depending on the object being operated on.

Technical breakdown:
Polymorphism is one of the four fundamental principles of object-oriented programming alongside encapsulation, inheritance, and abstraction. The word comes from Greek meaning many forms. In object-oriented programming it refers to the ability of different classes to be treated through a common interface while each class provides its own specific implementation of the behavior invoked through that interface.

There are two main types of polymorphism in object-oriented programming.

Subtype polymorphism, also called inclusion polymorphism or runtime polymorphism, occurs when a superclass reference is used to refer to objects of different subclasses. When a method is called through the superclass reference, the actual method executed is determined at runtime based on the true type of the object. This is implemented through method overriding and is the most common form discussed in exam contexts.

Parametric polymorphism, also called compile-time polymorphism or generics, allows a function or class to operate on values of different types without depending on the specific type. This is implemented through method overloading or generic type parameters.

The question asks specifically about operating on objects of different classes through the same interface and getting different behavior depending on the target class. This is the definition of subtype polymorphism, which in Japanese IT exams is called taso-sei (多相性) or porimo-rufizumu.

Option ア describes delegation (inin, 委譲). Delegation is a design pattern where an object receives a request and forwards it to another helper object to carry out the actual work. The original object delegates responsibility rather than implementing it directly. This is a code reuse technique, not a description of interface-based behavioral variation.

Option イ describes inheritance (keishou, 継承). Inheritance is the mechanism by which a subclass acquires the attributes and methods of a superclass. It creates an is-a relationship between classes. Inheritance is often used to enable polymorphism but it is not the same thing as polymorphism. Inheritance is the structural relationship. Polymorphism is the behavioral consequence of using that relationship through a common interface.

Option ウ describes composition (konpojishon, コンポジション). Composition is a design approach where a class contains instances of other classes as member variables rather than inheriting from them. It creates a has-a relationship. Composition is an alternative to inheritance for code reuse and does not inherently involve operating on different classes through the same interface.

Option エ describes polymorphism (taso-sei, 多相性). Operating on objects of different classes through the same interface and getting behavior specific to each class is exactly the definition of polymorphism. This is the correct answer.

Wrong answer analysis:
ア — Delegation is a runtime technique where object A calls object B to perform work on its behalf. The key difference from polymorphism is that delegation is about which object performs the work, not about which implementation of an interface gets invoked. A student who knows that delegation involves one object acting on behalf of another might confuse this with polymorphism if they focus on the idea of different objects doing different things, but the mechanism and purpose are distinct.
イ — Inheritance is the most common wrong answer here because it is closely related to polymorphism and is often taught alongside it. The distinction is that inheritance describes a structural class relationship while polymorphism describes the behavioral outcome of using objects of related classes through a shared interface. You can have inheritance without polymorphism and in some languages you can have polymorphism without classical inheritance. The question specifically says operating through the same interface to get different behavior, which is polymorphism not inheritance.
ウ — Composition is a structural design pattern that is often presented as an alternative to inheritance. Students studying design patterns will know composition well but it does not describe interface-based behavioral variation. Composition is about how objects are assembled, not about how they behave when accessed through a common interface.

Correct answer: エ`,
  },
  {
    id: 13,
    number: "問13",
    jp: "アジャイル開発手法の一つであるスクラムにおいて，プロダクトバックログアイテムの内容や並び順を決定する役割をもつのは誰か。",
    romaji: "Ajairu kaihatsu shuhou no hitotsu de aru sukuramu ni oite, purodakuto bakkurogu aitemu no naiyou ya narabijun o kettei suru yakuwari o motsu no wa dare ka.",
    en: "In Scrum, one agile development method, who has the role of deciding the content and order of the product backlog items?",
    options: [
      { jp: "開発者", romaji: "Kaihatsusha", en: "Developer" },
      { jp: "顧客", romaji: "Kokyaku", en: "Customer" },
      { jp: "スクラムマスタ", romaji: "Sukuramu masuta", en: "Scrum Master" },
      { jp: "プロダクトオーナ", romaji: "Purodakuto oona", en: "Product Owner" },
    ],
    correctAnswer: 3, // エ
    imagePath: null,
    explanation: `ELI5:
Imagine a sports team preparing for a season. Someone needs to decide which training drills to focus on this week, which ones come first, and which ones to drop from the schedule. That person is not the coach who runs the drills (that is the development team), not the referee who makes sure everyone follows the rules (that is the Scrum Master), and not the fans who want to see results (that is the customer). That person is the Product Owner. The Product Owner owns the list of everything the team needs to build, decides what is important, and sets the order in which things get done.
Now look at the wrong options. Option ア is the development team, whose job is to actually build the items in the backlog, not to decide their priority or content. Option イ is the customer, who may provide input and feedback but does not have the authority to directly manage the backlog in Scrum. Option ウ is the Scrum Master, whose job is to facilitate the Scrum process, remove obstacles, and coach the team, not to own or prioritize the backlog.

Technical breakdown:
Scrum is an agile development framework that organizes work into fixed-length iterations called sprints, typically lasting one to four weeks. Scrum defines three roles: the Product Owner, the Scrum Master, and the Development Team.

The Product Backlog is the ordered list of everything that needs to be done for the product. Each item in the list is called a Product Backlog Item (PBI). PBIs can represent features, bug fixes, technical improvements, or any other work that delivers value.

The Product Owner is solely responsible for the Product Backlog. This responsibility has two specific dimensions that the question tests directly.

First, content: the Product Owner decides what goes into the Product Backlog and ensures each item is clearly described so the development team understands what needs to be built.

Second, ordering (priority): the Product Owner decides the order in which items appear in the backlog. Items at the top are worked on first in the next sprint. The ordering reflects business value, risk, dependencies, and strategic priorities. The Product Owner may take input from stakeholders and the development team but the final decision on ordering belongs to the Product Owner alone.

The Development Team (option ア) is responsible for delivering a potentially shippable product increment at the end of each sprint. They select items from the top of the backlog during sprint planning and decide how to implement them. They do not control the content or ordering of the backlog.

The Customer (option イ) is a stakeholder who benefits from the product. In Scrum the customer may interact with the Product Owner and provide feedback during sprint reviews, but the customer does not directly manage the backlog. The Product Owner represents the interests of the customer and other stakeholders.

The Scrum Master (option ウ) is responsible for ensuring the Scrum framework is understood and followed. The Scrum Master coaches the team, facilitates Scrum events such as sprint planning and retrospectives, and removes impediments that block the team. The Scrum Master serves the Product Owner by facilitating backlog refinement sessions but does not own or prioritize the backlog.

Wrong answer analysis:
ア — The development team works from the backlog but does not control it. During sprint planning the team pulls items from the top of the backlog and commits to completing them in the sprint. They have input into how items are broken down and estimated but the content and ordering decisions belong to the Product Owner. A student who confuses who builds the work with who decides what to build will pick this option.
イ — The customer is a common wrong answer because intuitively the person who wants the product should decide what gets built first. In Scrum the Product Owner acts as the proxy for the customer and all stakeholders. Direct customer control over the backlog would create conflicting priorities and undermine the single point of authority that makes Scrum backlog management effective. The exam tests whether students know this specific Scrum role boundary.
ウ — The Scrum Master is a plausible wrong answer for students who know that the Scrum Master facilitates backlog refinement meetings. Facilitation is not the same as ownership. The Scrum Master helps the process run smoothly but has no authority over what goes into the backlog or in what order. Confusing facilitation with ownership is the specific trap this option sets.

Correct answer: エ`,
  },
  {
    id: 14,
    number: "問14",
    jp: "図は，あるプロジェクトの作業A〜Iとその作業日数を表している。このプロジェクトの最短所要日数は何日か。",
    romaji: "Zu wa, aru purojekuto no sagyou A kara I to sono sagyou nissuu o arawashite iru. Kono purojekuto no saitan shoyou nissuu wa nan nichi ka.",
    en: "The figure shows the tasks A–I of a project and their durations in days. What is the shortest number of days needed for this project?",
    options: [
      { jp: "27", romaji: "27", en: "27" },
      { jp: "28", romaji: "28", en: "28" },
      { jp: "29", romaji: "29", en: "29" },
      { jp: "31", romaji: "31", en: "31" },
    ],
    correctAnswer: 3, // エ
    imagePath: "public/questions/fe-2025-a/q14.png",
    explanation: `ELI5:
Imagine you are planning a road trip with several stops and some stops can only be visited after completing a previous one. The critical path is the longest chain of dependent stops. No matter how fast you drive between other stops, the total trip cannot be shorter than the time it takes to complete that longest chain. In project management the same logic applies. The shortest possible project duration is determined by the longest path through the network of dependent tasks, not by adding up all tasks or by finding the shortest route.
Now look at the structure of this network. Some tasks can run in parallel. The key is to trace every possible path from start to finish, calculate the total duration of each path, and the longest one is the critical path. The project cannot finish any faster than that.

Technical breakdown:
This question uses an arrow diagram, also called a PERT chart or network diagram. Nodes represent events (milestones) and arrows represent tasks with their durations. Dummy tasks shown as dashed arrows have zero duration and represent dependencies only.

First, reconstruct the network clearly from the diagram:

Start to N1: A(3)
N1 to N2: B(6)
N1 to N3: E(5), then dummy from N3 to N2 (duration 0)
N1 to N5: F(14)
N2 to N5: C(8)
N2 to N4: G(11), then dummy from N4 to N5 (duration 0)
N2 to N6: H(15)
N5 to N6: D(6)
N6 to End: I(5)

Next, calculate the earliest event time for each node by tracing all paths from Start.

Node N1: Start plus A(3) = 3

Node N2: There are two paths into N2.
Path via B: N1 + B(6) = 3 + 6 = 9
Path via E then dummy: N1 + E(5) + dummy(0) = 3 + 5 + 0 = 8
Earliest time for N2 = maximum of 9 and 8 = 9

Node N3: N1 + E(5) = 3 + 5 = 8

Node N4: N2 + G(11) = 9 + 11 = 20

Node N5: There are three paths into N5.
Path via F: N1 + F(14) = 3 + 14 = 17
Path via C: N2 + C(8) = 9 + 8 = 17
Path via G then dummy: N4 + dummy(0) = 20 + 0 = 20
Earliest time for N5 = maximum of 17, 17, and 20 = 20

Node N6: There are two paths into N6.
Path via H: N2 + H(15) = 9 + 15 = 24
Path via D: N5 + D(6) = 20 + 6 = 26
Earliest time for N6 = maximum of 24 and 26 = 26

End: N6 + I(5) = 26 + 5 = 31

The minimum project duration is 31 days.

The critical path is the sequence of tasks that determines this duration:
A(3) -> B(6) -> G(11) -> dummy(0) -> D(6) -> I(5) = 3 + 6 + 11 + 0 + 6 + 5 = 31

This matches option エ.

Wrong answer analysis:
ア (27) — This result comes from following the path through A, B, C, D, and I: 3 + 6 + 8 + 6 + 5 = 28, or from following A, F, D, I: 3 + 14 + 6 + 5 = 28. Neither gives 27 exactly. A student arriving at 27 has likely made an arithmetic error while tracing one of these paths, for example misreading F as 13 instead of 14 or dropping one task from the chain. This answer traps students who find a plausible long path but make a small arithmetic mistake.
イ (28) — This result comes from following the path A, B, C, D, I: 3 + 6 + 8 + 6 + 5 = 28, or from following A, F, D, I: 3 + 14 + 6 + 5 = 28. Both of these are real paths through the network and both give 28. This is the most dangerous trap because 28 is a valid path duration that looks like the longest path if a student misses the G path or forgets to account for the dummy task connecting N4 to N5. Students who do not trace all paths into N5 will land here.
ウ (29) — This result likely comes from a miscalculation along the G path, for example calculating N2 as 10 instead of 9 due to misreading task B as 7 instead of 6, giving 3 + 7 + 11 + 0 + 6 + 5 = 32, which does not match either. Alternatively a student might add the dummy task as duration 1 instead of 0, giving 3 + 6 + 11 + 1 + 6 + 5 = 32. The most likely path to 29 is miscounting A as 4 instead of 3 in the B-G chain: 4 + 6 + 11 + 0 + 3 + 5 = 29. This traps students who misread the starting task duration.

Correct answer: エ`,
  },
  {
    id: 15,
    number: "問15",
    jp: "サーバ室の物理的な安全対策の状況について，情報セキュリティ管理基準（平成28年）に照らして，情報セキュリティ監査を行って判明した状況のうち，監査人が，指摘事項として監査報告書に記載すべきものはどれか。",
    romaji: "Saaba shitsu no butsuri teki na anzen taisaku no joukyou ni tsuite, jouhou sekyuriti kanri kijun (Heisei 28-nen) ni terashite, jouhou sekyuriti kansa o okonatte hanmei shita joukyou no uchi, kansanin ga, shiteki jikou to shite kansa houkokusho ni kisai subeki mono wa dore ka.",
    en: "About the physical safety measures of a server room, judged against the Information Security Management Standard (2016), which situation found by the audit should the auditor write in the report as a point to be noted?",
    options: [
      { jp: "サーバが設置されている施設の無人領域では，営業時間中でも，警報装置が作動するようになっている。", romaji: "Saaba ga setchi sarete iru shisetsu no mujin ryouiki de wa, eigyou jikan chuu demo, keihou souchi ga sadou suru you ni natte iru.", en: "In the unmanned area of the facility where servers are placed, the alarm device works even during business hours." },
      { jp: "サーバ室に非常口，避難器具，誘導灯などを設置している。", romaji: "Saaba shitsu ni hijouguchi, hinan kigu, yuudoutou nado o setchi shite iru.", en: "The server room has an emergency exit, escape equipment, guide lights, and so on." },
      { jp: "社外からサーバ室へ直接出入りするドアを設置しているが，出入りを考慮して常時施錠していない。", romaji: "Shagai kara saaba shitsu e chokusetsu deiri suru doa o setchi shite iru ga, deiri o kouryo shite jouji sejou shite inai.", en: "There is a door that goes directly from outside the company into the server room, but for ease of entry it is not always locked." },
      { jp: "場所が分からないように，サーバ室の所在を室外に表示していない。", romaji: "Basho ga wakaranai you ni, saaba shitsu no shozai o shitsugai ni hyouji shite inai.", en: "So that the location is not known, the server room's whereabouts are not shown outside the room." },
    ],
    correctAnswer: 2, // ウ
    imagePath: null,
    explanation: `ELI5:
Imagine a security inspector visits a building that houses important company servers. The inspector has a checklist of rules that every secure server room must follow. The inspector walks through the building and notes down anything that violates the rules. At the end the inspector writes a report listing only the things that are actually broken or missing, not the things that are fine. The question asks which of the four situations the inspector would write up as a problem in the report.
Option ア is fine. Having an alarm system active even during business hours in unmanned areas is good security practice. Option イ is fine. Emergency exits, evacuation equipment, and guide lights are required safety installations, not security problems. Option エ is fine. Not displaying the location of the server room on signs outside is actually a good physical security practice since it reduces the chance of an attacker finding it. Option ウ is the problem. A door that allows direct access from outside the company into the server room and is never locked is a clear physical security violation. Any unauthorized person could walk straight into the server room.

Technical breakdown:
This question tests knowledge of physical security controls for server rooms as defined in the Japanese Information Security Management Standards (jouhou sekyuriti kanri kijun, published 2016). Physical security is one of the control domains in this standard and covers access control to secure areas, protection of equipment, and environmental controls.

The core principle being tested is that secure areas such as server rooms must have controlled access. Specifically, entry points must be secured to prevent unauthorized physical access. This includes locking doors, using access cards, biometric controls, or security personnel.

Option ア: An alarm system that activates during business hours in unmanned areas of the facility. This is a correct and appropriate security control. Unmanned areas are vulnerable even during business hours because no staff are present to detect intruders. Having alarms active at all times in such areas is consistent with the standard and would not be flagged as a problem.

Option イ: Installing emergency exits, evacuation equipment, and guide lights in the server room. This is a required safety installation under fire safety and building regulations. The information security management standard does not prohibit safety equipment. In fact, having proper evacuation provisions is expected. This would not be flagged as a problem.

Option ウ: A door that provides direct access from outside the company into the server room is installed but is not kept locked to allow entry and exit. This is a clear violation of physical access control requirements. The standard requires that access to secure areas be controlled and restricted to authorized personnel only. A permanently unlocked door that connects the outside world directly to the server room means anyone can enter without authorization. This is the item the auditor would flag as a finding in the audit report.

Option エ: The location of the server room is not displayed on signs outside the room. This is actually a recommended security practice called security through obscurity at the physical level. Reducing the visibility of the server room location makes it harder for unauthorized individuals to locate it. This would not be flagged as a problem and is consistent with the standard.

Wrong answer analysis:
ア — Students who are unfamiliar with physical security standards might think that keeping alarms active during business hours is excessive or unusual. In fact the standard specifically addresses the need for monitoring in unmanned areas regardless of whether the facility is open. Business hours do not guarantee that all areas are supervised. This option is designed to trap students who assume security measures only need to apply outside working hours.
イ — Emergency exits and evacuation equipment might look like a security concern to students who conflate physical safety with information security. A student might think that having an emergency exit in a server room creates an access control weakness. However the standard treats safety infrastructure as a requirement, not a vulnerability. The audit is checking information security compliance, not fire safety compliance, and having proper safety equipment is expected and compliant.
エ — Students who think that visible signage is required for emergency or administrative purposes might flag the absence of server room signs as a problem. In reality concealing the location of sensitive areas is a standard physical security recommendation. The absence of identifying signs is a feature, not a flaw. This option traps students who confuse transparency requirements in other contexts with physical security practice.

Correct answer: ウ`,
  },
  {
    id: 16,
    number: "問16",
    jp: "データマイニングの手法の一つであって，POSなどの蓄積データから“一緒に買われる商品”の組合せを発見する分析手法はどれか。",
    romaji: "Deeta mainingu no shuhou no hitotsu de atte, POS nado no chikuseki deeta kara “issho ni kawareru shouhin” no kumiawase o hakken suru bunseki shuhou wa dore ka.",
    en: "Which is the analysis method, one of data mining, that finds combinations of 'products bought together' from stored data such as POS data?",
    options: [
      { jp: "3C分析", romaji: "San-shii bunseki", en: "3C analysis" },
      { jp: "ABC分析", romaji: "Ee-bii-shii bunseki", en: "ABC analysis" },
      { jp: "コンジョイント分析", romaji: "Konjointo bunseki", en: "Conjoint analysis" },
      { jp: "マーケットバスケット分析", romaji: "Maaketto basuketto bunseki", en: "Market basket analysis" },
    ],
    correctAnswer: 3, // エ
    imagePath: null,
    explanation: `ELI5:
Imagine you run a supermarket and you have mountains of data from your checkout scanners recording every single purchase every customer makes. You want to find patterns like: customers who buy bread also tend to buy butter, or customers who buy diapers also tend to buy beer. Finding these kinds of patterns, where products tend to be bought together, is called market basket analysis. The name comes from the idea of looking inside each customer's shopping basket and finding what items appear together repeatedly across thousands of baskets.
Now look at the wrong options. Option ア is 3C analysis, which is a business strategy framework that examines Company, Competitor, and Customer. It has nothing to do with finding product combinations in sales data. Option イ is ABC analysis, which is an inventory management technique that ranks products by sales volume or value into three categories A, B, and C to prioritize stock management. It does not find combinations of products bought together. Option ウ is conjoint analysis, which is a market research technique used to understand how customers value different combinations of product features or attributes. It involves surveys and preference modeling, not mining transaction data for co-purchase patterns.

Technical breakdown:
Data mining is the process of discovering patterns, correlations, and insights from large datasets using statistical and computational techniques. The question asks about a specific data mining technique used with POS (Point of Sale) data to find product combinations that are frequently purchased together.

Market basket analysis is the correct technique. It is a data mining method based on association rule learning. The goal is to identify sets of items that frequently co-occur in transactions. The output is a set of association rules in the form: if a customer buys item X then they are likely to also buy item Y.

The key metrics used in market basket analysis are support, confidence, and lift.

Support measures how frequently a combination of items appears in the total set of transactions. For example if bread and butter appear together in 200 out of 1,000 transactions the support is 0.20 or 20 percent.

Confidence measures how often the rule is correct. If bread appears in 400 transactions and bread and butter appear together in 200 transactions, the confidence of the rule bread implies butter is 200 divided by 400 which is 0.50 or 50 percent.

Lift measures how much more likely the combination is compared to what would be expected if the items were purchased independently. A lift greater than 1 indicates a genuine positive association.

The most well-known algorithm for market basket analysis is the Apriori algorithm, which efficiently searches large transaction databases for frequent itemsets.

POS systems generate exactly the kind of transaction data that market basket analysis requires: each transaction record contains the set of items purchased together in one visit. Analyzing millions of such records reveals statistically significant co-purchase patterns that can be used for product placement, cross-selling, and promotions.

Option ア describes 3C analysis (3C bunseki). This is a strategic planning framework that analyzes three entities: Company (jisha), Competitor (kyougousha), and Customer (kokyaku). It is used for business strategy formulation, not for mining transaction data.

Option イ describes ABC analysis (ABC bunseki). This is an inventory classification technique derived from the Pareto principle. Items are ranked by total sales value or volume and divided into three tiers: A items are the top 10 to 20 percent that generate around 70 to 80 percent of revenue, B items are mid-range, and C items are the long tail of low-volume products. It classifies individual products, not combinations of products bought together.

Option ウ describes conjoint analysis (konjointto bunseki). This is a market research technique used to measure customer preferences for different product attributes. Respondents are shown hypothetical product configurations and asked to rate or rank them. Statistical analysis reveals how much each attribute contributes to overall preference. This involves designed surveys, not mining of actual transaction records.

Option エ describes market basket analysis (maakettu basuketto bunseki). Finding combinations of products that tend to be purchased together from accumulated POS data is the exact definition of market basket analysis. This is the correct answer.

Wrong answer analysis:
ア — 3C analysis is a well-known business framework and students who have studied business strategy will recognize it immediately. The trap is that it sounds data-driven and analytical. However 3C analysis is a qualitative strategic tool used in planning sessions, not a computational technique applied to transaction databases. A student who pattern-matches on the word analysis without thinking about what kind of analysis will be drawn to this option.
イ — ABC analysis is a genuine data analysis technique applied to POS and inventory data, which makes it a realistic trap. The critical difference is that ABC analysis classifies individual items by their own sales performance. Market basket analysis finds relationships between pairs or groups of items. A student who knows that ABC analysis is used in retail inventory management might pick this option without noticing that the question asks specifically about combinations of items being bought together.
ウ — Conjoint analysis involves analyzing combinations of attributes, which superficially resembles market basket analysis involving combinations of products. The key difference is the data source and method. Conjoint analysis uses survey responses about hypothetical product configurations. Market basket analysis uses actual historical transaction records. A student who remembers that conjoint analysis involves combinations will be drawn to this option but the combination being analyzed is fundamentally different.

Correct answer: エ`,
  },
  {
    id: 17,
    number: "問17",
    jp: "インターネット上の生成AIサービスを利用する際に，オプトアウトを設定することはどのような場合に有効か。",
    romaji: "Intaanetto jou no seisei AI saabisu o riyou suru sai ni, oputo auto o settei suru koto wa dono you na baai ni yuukou ka.",
    en: "When using a generative AI service on the internet, in what case is setting an opt-out useful?",
    options: [
      { jp: "個々の利用者が，自身が生成AIから得た情報に対して，著作権を主張したい場合", romaji: "Koko no riyousha ga, jishin ga seisei AI kara eta jouhou ni taishite, chosakuken o shuchou shitai baai", en: "When an individual user wants to claim copyright over the information they got from the generative AI." },
      { jp: "個々の利用者が入力した情報を，生成AIの学習に利用させたくない場合", romaji: "Koko no riyousha ga nyuuryoku shita jouhou o, seisei AI no gakushuu ni riyou sasetakunai baai", en: "When an individual user does not want the information they entered to be used for the generative AI's training." },
      { jp: "個々の利用者が入力した情報を，生成AIを通じて，他の利用者にも知ってほしい場合", romaji: "Koko no riyousha ga nyuuryoku shita jouhou o, seisei AI o tsuujite, hoka no riyousha ni mo shitte hoshii baai", en: "When an individual user wants other users to know, through the generative AI, the information they entered." },
      { jp: "生成AIから得た情報の信ぴょう性を高めたい場合", romaji: "Seisei AI kara eta jouhou no shinpyousei o takametai baai", en: "When you want to raise the reliability of the information you got from the generative AI." },
    ],
    correctAnswer: 1, // イ
    imagePath: null,
    explanation: `ELI5:
Imagine you signed up for a newsletter and at the bottom of every email there is a link that says click here to stop receiving these emails. Clicking that link is opting out. You are telling the service: do not use my information for this purpose anymore. In the context of generative AI services, opting out means telling the AI service provider: do not use the data I enter into your system to train your AI models. By default many AI services collect what users type in and use it to improve their models. Opting out turns that off for your account.
Now look at the wrong options. Option ア is about claiming copyright over information received from the AI. Opting out has nothing to do with copyright claims. Option ウ is about wanting other users to see your input, which is the opposite of opting out since opting out is about restricting what is done with your data, not sharing it more widely. Option エ is about improving the reliability of AI outputs, which opting out does not affect at all since it only controls data usage for training purposes.

Technical breakdown:
Opt-out is a data privacy mechanism that allows users to withdraw consent for a specific use of their personal data. It operates on an opt-out model, meaning the default state is that data collection or use is enabled, and the user must take an explicit action to disable it. This is in contrast to an opt-in model where data collection is disabled by default and the user must actively enable it.

In the context of generative AI services, the specific use case for opt-out that this question targets is the use of user-submitted input data for model training. When a user interacts with a generative AI service by entering prompts, questions, or other content, that input data may by default be collected and used by the service provider to further train or fine-tune the AI model. Opting out prevents this specific use of the user's data.

This is relevant for several reasons. Users may enter sensitive or confidential information into AI systems, such as proprietary business data, personal information, or confidential client details. If that data is used for model training, it could potentially influence the model's outputs in ways that expose confidential information to other users. Opting out prevents this risk.

Option ア: A user wanting to claim copyright over information received from the AI. Copyright ownership of AI-generated content is a legal question that depends on jurisdiction and the terms of service of the AI provider. Opting out has no bearing on copyright claims. These are entirely separate legal and technical concepts.

Option イ: A user not wanting their input data to be used for AI model training. This is the precise use case for opt-out in AI services. The user is withdrawing consent for their data to be used for a specific purpose, namely model training. This is the correct answer.

Option ウ: A user wanting their input to be seen by other users through the AI. This describes the opposite of a privacy protection mechanism. Sharing data with other users through the system would require explicit data sharing features, not an opt-out setting. Opting out is about restricting data use, not expanding it.

Option エ: Wanting to improve the reliability of information obtained from the AI. Opting out of data collection for training has no direct effect on the quality or reliability of AI outputs for the individual user. Reliability improvements come from model architecture, training data quality, and inference techniques, none of which are controlled by an individual user's opt-out setting.

Wrong answer analysis:
ア — Copyright over AI-generated content is a genuinely contested and emerging legal topic that many users are curious about. A student who has read about AI and intellectual property might associate opting out with some kind of rights claim over AI outputs. However opt-out is purely a data privacy mechanism about how input data is used, not a legal instrument for asserting ownership of outputs. These two concepts operate in completely different domains.
ウ — This option describes something closer to a data sharing or publication feature rather than a privacy control. A student who misreads opt-out as opt-in, or who confuses the direction of data flow, might pick this option. The key signal in the correct answer is the phrase not wanting data to be used for training, which is a restriction on use, not a request for broader sharing.
エ — Students who associate opting out with improving their own AI experience might pick this option. The reasoning would be: if I opt out of having my data used in a way I do not want, my experience will be better and the AI will be more reliable for me. This is a logical-sounding but incorrect inference. Opt-out affects only how the provider uses your data in aggregate model training. It does not change the model's inference behavior for any individual user.

Correct answer: イ`,
  },
  {
    id: 18,
    number: "問18",
    jp: "物販事業において，ロングテールをビジネスとして成功させるために必要な施策はどれか。",
    romaji: "Buppan jigyou ni oite, rongu teeru o bijinesu to shite seikou saseru tame ni hitsuyou na sesaku wa dore ka.",
    en: "In a product-sales business, which measure is needed to make the long tail succeed as a business?",
    options: [
      { jp: "多くの有名ブランド店が出店するショッピングモールの構築", romaji: "Ooku no yuumei burando ten ga shutten suru shoppingu mooru no kouchiku", en: "Building a shopping mall where many famous brand stores open." },
      { jp: "交通の利便性が高い地域に対する，生活必需品を広く浅く取りそろえた出店計画", romaji: "Koutsuu no riben sei ga takai chiiki ni taisuru, seikatsu hitsujuhin o hiroku asaku torisoroeta shutten keikaku", en: "A store plan in a place with good transport access, stocking daily necessities widely but shallowly." },
      { jp: "店舗で購入した商品を近隣地域に無償で配送するサービスの実施", romaji: "Tenpo de kounyuu shita shouhin o kinrin chiiki ni mushou de haisou suru saabisu no jisshi", en: "Running a service that delivers goods bought at the store to nearby areas for free." },
      { jp: "豊富な品ぞろえと，在庫コストや配送費用を抑えるための大規模な物流センタの構築や活用", romaji: "Houfu na shinazoroe to, zaiko kosuto ya haisou hiyou o osaeru tame no daikibo na butsuryuu senta no kouchiku ya katsuyou", en: "A rich product lineup, and building or using a large logistics center to hold down inventory and delivery costs." },
    ],
    correctAnswer: 3, // エ
    imagePath: null,
    explanation: `ELI5:
Imagine a small shop in a busy shopping street that can only display ten popular products in its window because space is limited. It sells those ten products really well but cannot stock the hundreds of other products that exist. Now imagine an online store with a giant warehouse that can stock thousands of products, including very niche and obscure ones that almost nobody buys individually. Even though each niche product sells only a few units, there are so many of them that their combined sales add up to more than the sales of the popular ten products. That combined revenue from thousands of low-selling niche products is the long tail.
For this business model to work the online store needs two things above all else. First it needs an enormous variety of products to stock, because the whole point is having things that nobody else carries. Second it needs to keep the cost of storing and delivering all those products as low as possible, otherwise the small profit from each niche sale gets eaten up by logistics costs. A large and efficient distribution center is what makes both of these possible. That is why option エ is the correct answer.
Now look at the wrong options. Option ア is about building a shopping mall with famous brand stores. Famous brands are the opposite of the long tail. They represent the popular head of the distribution, not the niche tail. Option イ is about opening physical stores in convenient locations with a broad but shallow product range. Physical stores have limited shelf space, which is exactly the constraint that prevents long tail businesses from working in physical retail. Option ウ is about free local delivery, which reduces friction for nearby customers but does nothing to expand the product range or reduce warehouse costs at scale.

Technical breakdown:
The long tail is a business and economic concept introduced by Chris Anderson in 2004 in Wired magazine and later expanded in his 2006 book The Long Tail: Why the Future of Business is Selling Less of More. The concept describes a statistical distribution of product sales where a small number of popular products (the head) sell in very large quantities and a very large number of niche products (the tail) each sell in small quantities. In a traditional physical retail environment only the head products are stocked because shelf space is limited and only high-volume products justify their placement cost.

The internet and large-scale logistics infrastructure changed this equation by making it economically viable to stock and sell tail products. The key insight is that the aggregate revenue from the entire tail can match or exceed the revenue from the head, provided that the cost of stocking and delivering each tail product is kept low enough.

The necessary conditions for a successful long tail business model are:

First, a very large and diverse product catalog. The long tail only generates significant aggregate revenue when there are enough tail products. A catalog of hundreds of thousands or millions of products is typical. This requires a scalable inventory management system.

Second, low per-unit storage and fulfillment costs. Niche products generate low revenue per unit. If the cost of storing and shipping each unit is high, the margin disappears. Large-scale distribution centers achieve economies of scale that reduce per-unit costs to levels where even low-volume products remain profitable.

Third, effective search and recommendation systems. Customers cannot browse millions of products manually. Search engines, recommendation algorithms, and user reviews are essential for connecting customers to the specific niche products they want. Without discoverability the tail products cannot be found and will not sell.

Option ア describes building a shopping mall with famous brand stores. This targets the head of the distribution, not the tail. Famous brands sell popular high-volume products. This is the exact opposite of a long tail strategy.

Option イ describes opening physical stores in convenient locations with a broad but shallow product range. Physical stores are constrained by floor space and local demand. A broad but shallow range means many categories but few products per category, which is not the same as the deep niche catalog required for long tail success. Physical retail economics do not support the long tail model.

Option ウ describes offering free local delivery for products purchased in store. This is a customer service enhancement for existing physical retail. It does not expand the product catalog or reduce storage costs at scale. It is irrelevant to the long tail model.

Option エ describes building a rich product catalog combined with a large-scale distribution center to suppress inventory and shipping costs. This directly addresses both necessary conditions for long tail success: catalog breadth and cost efficiency. This is the correct answer.

Wrong answer analysis:
ア — Students who associate long tail with popularity or success might think that stocking famous brands is a good business strategy and pick this option. The trap is that long tail is specifically about niche products, not popular ones. Famous brand stores represent the head of the curve, which is what long tail strategy deliberately moves away from.
イ — A broad but shallow product range sounds similar to a large catalog, which is what the long tail requires. The critical difference is depth versus breadth. A broad shallow range covers many categories superficially. The long tail requires deep coverage of niche products within categories. Also the physical store constraint means that even a broad range is limited by shelf space in ways that a warehouse-based online business is not.
ウ — Free local delivery sounds like a logistics improvement, and since long tail success depends partly on logistics efficiency, a student might connect the two. However free local delivery is a last-mile service for physical store customers. It does not address the fundamental requirements of long tail, which are catalog scale and warehouse-level logistics cost reduction. Local delivery from a physical store with limited inventory is structurally incapable of supporting a long tail model.

Correct answer: エ`,
  },
  {
    id: 19,
    number: "問19",
    jp: "表の条件で喫茶店を開業したい。月10万円の利益を出すためには，1客席当たり1日平均何人の客が必要か。条件：客1人当たりの売上高500円，変動費100円，固定費300,000円／月，営業日数20日，客席数10席。",
    romaji: "Hyou no jouken de kissaten o kaigyou shitai. Tsuki juu-man en no rieki o dasu tame ni wa, ichi kyakuseki atari ichinichi heikin nan-nin no kyaku ga hitsuyou ka. Jouken: kyaku hitori atari no uriagedaka 500-en, hendouhi 100-en, koteihi 300,000-en / tsuki, eigyou nissuu 20-nichi, kyakuseki suu 10-seki.",
    en: "You want to open a cafe under the conditions in the table. To make a profit of 100,000 yen per month, how many customers per seat per day on average are needed? Conditions: sales per customer 500 yen, variable cost 100 yen, fixed cost 300,000 yen/month, 20 business days, 10 seats.",
    options: [
      { jp: "3.75", romaji: "3.75", en: "3.75" },
      { jp: "4", romaji: "4", en: "4" },
      { jp: "4.2", romaji: "4.2", en: "4.2" },
      { jp: "5", romaji: "5", en: "5" },
    ],
    correctAnswer: 3, // エ
    imagePath: null,
    explanation: `ELI5:
Imagine you want to open a small coffee shop and you need to figure out how many customers you need per seat per day to make a profit of 100,000 yen per month. You know your fixed costs like rent and salaries are 300,000 yen per month no matter how many customers you get. You also know that each customer brings in 500 yen but costs you 100 yen in ingredients and supplies, leaving you 400 yen of contribution per customer. You need enough customers to cover the fixed costs and then earn an extra 100,000 yen on top.
The total money you need to collect above your variable costs is 300,000 plus 100,000 which equals 400,000 yen per month. Each customer contributes 400 yen. So you need 400,000 divided by 400 which equals 1,000 customers per month. Now you have 10 seats and 20 business days per month. So you need 1,000 divided by 20 days divided by 10 seats which equals 5 customers per seat per day. That matches option エ.

Technical breakdown:
This question applies the contribution margin approach to break-even and target profit analysis.

Key definitions:
Selling price per customer = 500 yen
Variable cost per customer = 100 yen
Contribution margin per customer = selling price minus variable cost = 500 minus 100 = 400 yen
Fixed cost per month = 300,000 yen
Target profit per month = 100,000 yen
Number of seats = 10
Business days per month = 20

Step 1: Calculate the total contribution margin required.
Total required = fixed cost plus target profit = 300,000 + 100,000 = 400,000 yen

Step 2: Calculate the total number of customers required per month.
Total customers = total required divided by contribution margin per customer
Total customers = 400,000 divided by 400 = 1,000 customers per month

Step 3: Calculate the number of customers per seat per day.
Customers per seat per day = total customers divided by business days divided by number of seats
Customers per seat per day = 1,000 divided by 20 divided by 10 = 5

This matches option エ.

The contribution margin concept is central to this calculation. The contribution margin represents the amount each unit of sales contributes toward covering fixed costs and generating profit after variable costs are deducted. It is distinct from gross profit in that it is calculated on a per-unit basis before fixed costs are allocated.

Break-even analysis extends this: the break-even point is where total contribution margin equals total fixed costs and profit is zero. In this question the target is not break-even but a specific profit of 100,000 yen, so the fixed costs and target profit are combined into a single target contribution margin figure.

Wrong answer analysis:
ア (3.75) — This result comes from forgetting to add the target profit to the fixed costs before dividing. A student who divides only the fixed cost by the contribution margin gets 300,000 divided by 400 = 750 customers per month. Then 750 divided by 20 divided by 10 = 3.75. This is the break-even number of customers, not the number needed to achieve the 100,000 yen profit target. This is the most common mistake in target profit questions: solving for break-even instead of the stated profit target.
イ (4) — This result comes from using the selling price instead of the contribution margin as the denominator. A student who calculates total customers as 400,000 divided by 500 gets 800 customers. Then 800 divided by 20 divided by 10 = 4. This error treats all revenue as contribution without deducting variable costs, which inflates the denominator and understates the number of customers needed. Alternatively a student might calculate break-even customers correctly as 750 and then add a partial adjustment for the profit target incorrectly.
ウ (4.2) — This result likely comes from a combination of errors, for example using 300,000 plus 100,000 = 400,000 correctly but then dividing by 500 yen selling price instead of 400 yen contribution margin, giving 800 customers, and then dividing by a wrong number of days or seats. Another path to 4.2 is calculating 400,000 divided by 400 = 1,000 customers correctly but then dividing by 20 days and 12 seats instead of 10, giving approximately 4.17 which rounds to 4.2. This traps students who get the contribution margin right but misread the number of seats.

Correct answer: エ`,
  },
  {
    id: 20,
    number: "問20",
    jp: "カーボンフットプリントの説明として，適切なものはどれか。",
    romaji: "Kaabon futto purinto no setsumei to shite, tekisetsu na mono wa dore ka.",
    en: "Which is the appropriate description of a carbon footprint?",
    options: [
      { jp: "温室効果ガスの排出量から吸収量と除去量を差し引いた合計をゼロにする取組", romaji: "Onshitsu kouka gasu no haishutsu ryou kara kyuushuu ryou to jokyo ryou o sashihiita goukei o zero ni suru torikumi", en: "An effort to make the total zero by subtracting the amount absorbed and removed from the amount of greenhouse gas emitted." },
      { jp: "原材料調達から廃棄・リサイクルに至るまでのライフサイクル全体を通して排出される温室効果ガスの排出量を，CO2量に換算して，その値を商品やサービスに表示すること", romaji: "Genzairyou choutatsu kara haiki, risaikuru ni itaru made no raifu saikuru zentai o tooshite haishutsu sareru onshitsu kouka gasu no haishutsu ryou o, CO2 ryou ni kansan shite, sono atai o shouhin ya saabisu ni hyouji suru koto", en: "Converting the greenhouse gas emitted across the whole life cycle, from material sourcing to disposal and recycling, into a CO2 amount and showing that value on the product or service." },
      { jp: "自動車のエンジンから排出される一酸化炭素，窒素酸化物や炭化水素類などの大気汚染物質の排出量の定め", romaji: "Jidousha no enjin kara haishutsu sareru issanka tanso, chisso sankabutsu ya tanka suiso rui nado no taiki osen busshitsu no haishutsu ryou no sadame", en: "A rule on the emission amount of air-polluting substances such as carbon monoxide, nitrogen oxides, and hydrocarbons from car engines." },
      { jp: "商品がどのような場所で作られて，流通し，販売されているかを把握するための仕組み", romaji: "Shouhin ga dono you na basho de tsukurarete, ryuutsuu shi, hanbai sarete iru ka o haaku suru tame no shikumi", en: "A system to grasp in what places a product is made, distributed, and sold." },
    ],
    correctAnswer: 1, // イ
    imagePath: null,
    explanation: `ELI5:
Imagine you buy a chocolate bar. On the back of the wrapper there is a number that tells you exactly how much carbon dioxide was released into the atmosphere to make that chocolate bar, from growing the cocoa beans, to shipping them, to making the chocolate, to wrapping it, to delivering it to the shop, and even accounting for what happens when the wrapper is thrown away. That number on the wrapper is the carbon footprint. It covers the entire life of the product from birth to death and converts all the different greenhouse gases involved into a single CO2-equivalent number so you can compare products fairly.
Now look at the wrong options. Option ア describes carbon neutrality, which is the goal of making total greenhouse gas emissions equal zero by balancing emissions with absorption and removal. Option ウ describes vehicle exhaust emission standards, which are regulations about specific pollutants from car engines and have nothing to do with lifecycle CO2 accounting. Option エ describes a product traceability system, which tracks where a product was made and how it moved through the supply chain, but does not measure or display emissions data.

Technical breakdown:
Carbon footprint, known in Japanese as kaabonfuttopurinto, is a measure of the total greenhouse gas emissions caused directly and indirectly by a product, service, organization, or individual. The value is expressed in units of CO2 equivalent (CO2e) to allow comparison across different types of greenhouse gases such as carbon dioxide, methane, and nitrous oxide, each of which has a different global warming potential.

The specific definition tested in this question involves three key elements that together distinguish carbon footprint from related concepts.

First, lifecycle scope. Carbon footprint measurement covers the entire lifecycle of a product or service, from raw material extraction through production, distribution, use, and final disposal or recycling. This approach is called Life Cycle Assessment (LCA). The Japanese term is raifu saikuru zentai, meaning the full life cycle.

Second, CO2 equivalent conversion. All greenhouse gases emitted at each stage are converted into a single CO2-equivalent figure using standardized global warming potential coefficients. This allows the total environmental impact to be expressed as a single number regardless of which gases were actually emitted.

Third, display on products or services. The carbon footprint value is communicated to consumers by labeling it on the product or service. This transparency allows consumers to make informed purchasing decisions based on the environmental impact of what they buy.

Option ア describes carbon neutrality (kaabonniyutoraru). Carbon neutrality is the state where greenhouse gas emissions are balanced by an equivalent amount of absorption or removal, resulting in a net emission of zero. Achieving carbon neutrality involves reducing emissions and offsetting remaining emissions through mechanisms such as reforestation or carbon capture. This is a target or outcome, not a measurement and labeling system.

Option イ describes carbon footprint precisely. The lifecycle scope, CO2 equivalent conversion, and product labeling are all present. This is the correct answer.

Option ウ describes vehicle exhaust emission standards. These are regulatory limits on specific pollutants such as carbon monoxide, nitrogen oxides, and hydrocarbons emitted from internal combustion engines. These are engineering standards for a specific product category, not a lifecycle accounting and labeling system covering all products and services.

Option エ describes a product traceability system (toreerabiliti). Traceability systems track the origin, movement, and transformation of products through the supply chain. They answer questions like where was this made, who handled it, and how did it get here. They do not measure or communicate greenhouse gas emissions.

Wrong answer analysis:
ア — Carbon neutrality and carbon footprint are both climate-related terms and both involve greenhouse gas accounting, which makes them easy to confuse. The key distinction is that carbon neutrality is a goal about net emissions at an organizational or national level, while carbon footprint is a measurement and communication tool applied to individual products and services across their full lifecycle. A student who knows both terms exist but is fuzzy on the precise definitions will be drawn to this option because it mentions greenhouse gases and emissions.
ウ — Vehicle exhaust emission standards mention specific pollutants and emission quantities, which sounds like it could relate to carbon measurement. The trap is that vehicle emission standards are narrow engineering regulations covering specific gases from a specific type of product. Carbon footprint is a broad lifecycle accounting concept covering all greenhouse gases from all types of products and services. A student who associates carbon footprint with car emissions due to the everyday association between cars and pollution will be drawn to this option.
エ — Traceability covers the supply chain journey of a product, and since carbon footprint also involves tracking a product through its lifecycle, the two concepts have surface-level similarities. The critical difference is that traceability tracks location and custody while carbon footprint tracks emissions. A student who reads the phrase from raw material procurement to disposal and associates it with lifecycle tracking rather than emissions measurement will be drawn to this option.

Correct answer: イ`,
  },
];

// app.js expects q.options to be a flat string array, plus q.text and
// q.translation.{japanese,romaji,english}. The authored data above keeps the full
// jp/romaji/en structure; here we derive the shapes app.js reads, WITHOUT touching app.js.
// - q.optionTranslations: the per-option {jp,romaji,en} objects (authored structure preserved)
// - q.options: flat jp strings (what app.js renders)
QUESTIONS.forEach((q) => {
  q.optionTranslations = q.options;          // keep structured per-option translations
  q.options = q.options.map((o) => o.jp);    // flatten to jp strings for app.js
  q.text = q.jp;
  q.translation = { japanese: q.jp, romaji: q.romaji, english: q.en };
});

const QUIZ = {
  examSet: "基本情報技術者試験 科目A",
  year: "令和7年度 (2025)",
  questions: QUESTIONS,
};
