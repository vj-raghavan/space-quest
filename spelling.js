// --- Space Quest — Spelling Star Base ---
// Two question styles for the spelling planet:
//   • spot / spot2  — tap the correct spelling among misspellings (choice pad)
//   • build / build2 — assemble the word from scrambled letter tiles
// Each word carries kid-plausible misspellings and a memory hint that becomes
// the teaching moment. Clues never contain the word itself.

const SPELL_EASY = [
  { word: 'house', emoji: '🏠', clue: 'The building you live in', wrongs: ['howse', 'hous'], hint: '<b>ou</b> makes the OW sound: h-OU-se 🏠' },
  { word: 'party', emoji: '🎈', clue: 'Balloons, cake and games!', wrongs: ['partey', 'parti'], hint: 'it ends in <b>y</b> — part-Y! 🎈' },
  { word: 'happy', emoji: '😊', clue: 'How you feel on your birthday', wrongs: ['hapy', 'happe'], hint: 'double <b>p</b> and a <b>y</b> at the end! 😊' },
  { word: 'sunny', emoji: '☀️', clue: 'Bright, warm weather', wrongs: ['suny', 'sunnie'], hint: 'double the <b>n</b>: sun + n + y ☀️' },
  { word: 'candy', emoji: '🍬', clue: 'A sweet treat', wrongs: ['candey', 'kandy'], hint: 'starts with <b>c</b>, ends with <b>y</b> 🍬' },
  { word: 'tiger', emoji: '🐯', clue: 'A big striped cat', wrongs: ['tigur', 'tyger'], hint: 't-i-g-<b>er</b> — ER at the end! 🐯' },
  { word: 'water', emoji: '💧', clue: 'You drink it every day', wrongs: ['watter', 'woter'], hint: 'only ONE <b>t</b>: wa-ter 💧' },
  { word: 'sister', emoji: '👧', clue: 'A girl in your family', wrongs: ['sistur', 'sester'], hint: 'sis + <b>ter</b> 👧' },
  { word: 'pencil', emoji: '✏️', clue: 'You write with it', wrongs: ['pensil', 'pencle'], hint: 'the <b>c</b> makes the S sound: pen-CIL ✏️' },
  { word: 'rocket', emoji: '🚀', clue: 'It blasts off into space', wrongs: ['rokit', 'rockit'], hint: 'rock + <b>et</b> 🚀' },
  { word: 'planet', emoji: '🪐', clue: 'Earth and Mars are these', wrongs: ['plannet', 'planit'], hint: 'plan + <b>et</b> — one n! 🪐' },
  { word: 'monkey', emoji: '🐒', clue: 'A cheeky animal that loves bananas', wrongs: ['munkey', 'monkee'], hint: 'm-o-n-k-<b>ey</b> — EY at the end! 🐒' },
  { word: 'jungle', emoji: '🌴', clue: 'A thick forest full of animals', wrongs: ['jungel', 'jungal'], hint: 'it ends in <b>le</b>: jun-g-LE 🌴' },
  { word: 'winter', emoji: '⛄', clue: 'The coldest season', wrongs: ['wintur', 'winnter'], hint: 'win + <b>ter</b> — one n! ⛄' },
  { word: 'garden', emoji: '🌷', clue: 'Where flowers grow at home', wrongs: ['gardin', 'gardun'], hint: 'gar-d-<b>en</b> — EN at the end 🌷' },
  { word: 'yellow', emoji: '💛', clue: 'The colour of the sun', wrongs: ['yelow', 'yellaw'], hint: 'double <b>l</b>: ye-LL-ow 💛' },
  { word: 'little', emoji: '🐭', clue: 'The opposite of big', wrongs: ['littel', 'litle'], hint: 'double <b>t</b> then <b>le</b>: li-tt-le 🐭' },
  { word: 'summer', emoji: '🏖️', clue: 'The hottest season', wrongs: ['sumer', 'summur'], hint: 'double <b>m</b>: su-MM-er 🏖️' },
  { word: 'dinner', emoji: '🍽️', clue: 'The meal you eat in the evening', wrongs: ['diner', 'dinnur'], hint: 'double <b>n</b>: di-NN-er 🍽️' },
  { word: 'rabbit', emoji: '🐰', clue: 'A hopping animal with long ears', wrongs: ['rabit', 'rabbet'], hint: 'double <b>b</b>: ra-BB-it 🐰' },
  { word: 'spider', emoji: '🕷️', clue: 'It has eight legs and spins webs', wrongs: ['spyder', 'spidur'], hint: 'sp-<b>i</b>-der — i in the middle! 🕷️' },
  { word: 'dragon', emoji: '🐉', clue: 'A fire-breathing storybook creature', wrongs: ['dragun', 'draggon'], hint: 'drag + <b>on</b> — one g! 🐉' },
  { word: 'magic', emoji: '✨', clue: 'What a wizard does', wrongs: ['majic', 'magick'], hint: 'the <b>g</b> sounds like J: ma-GIC ✨' },
  { word: 'music', emoji: '🎵', clue: 'Songs and tunes you listen to', wrongs: ['musik', 'moosic'], hint: 'it ends in <b>c</b>: mu-si-C 🎵' },
  { word: 'apple', emoji: '🍎', clue: 'A crunchy red or green fruit', wrongs: ['appel', 'aple'], hint: 'double <b>p</b> then <b>le</b>: a-PP-le 🍎' },
  { word: 'bread', emoji: '🍞', clue: 'You toast it for breakfast', wrongs: ['bred', 'brade'], hint: '<b>ea</b> makes the E sound: br-EA-d 🍞' },
  { word: 'brave', emoji: '🦸', clue: 'Not scared of anything', wrongs: ['brayv', 'brav'], hint: 'a silent <b>e</b> at the end makes the A say its name! 🦸' },
  { word: 'chair', emoji: '🪑', clue: 'You sit on it', wrongs: ['chare', 'cheir'], hint: 'ch + <b>air</b> 🪑' },
  { word: 'cloud', emoji: '☁️', clue: 'White and fluffy in the sky', wrongs: ['clowd', 'clode'], hint: '<b>ou</b> makes the OW sound: cl-OU-d ☁️' },
  { word: 'dance', emoji: '💃', clue: 'Moving your body to a song', wrongs: ['danse', 'dants'], hint: 'the <b>c</b> sounds like S: dan-CE 💃' },
  { word: 'night', emoji: '🌙', clue: 'When the stars come out', wrongs: ['nite', 'nihgt'], hint: '<b>igh</b>: n-IGH-t 🌙' },
  { word: 'light', emoji: '💡', clue: 'You switch it on in the dark', wrongs: ['lite', 'ligt'], hint: '<b>igh</b>: l-IGH-t 💡' },
  { word: 'mother', emoji: '👩', clue: 'Another word for your mum', wrongs: ['muther', 'mothur'], hint: 'the <b>o</b> sounds like U: m-O-ther 👩' },
  { word: 'father', emoji: '👨', clue: 'Another word for your dad', wrongs: ['fathur', 'fother'], hint: 'fa + <b>ther</b> 👨' },
  { word: 'brother', emoji: '👦', clue: 'A boy in your family', wrongs: ['bruther', 'brothur'], hint: 'bro + <b>ther</b> — like father and mother! 👦' },
  { word: 'animal', emoji: '🦁', clue: 'A lion, dog or cat is one', wrongs: ['animel', 'anamal'], hint: 'an-i-m<b>al</b> — it ends in AL 🦁' },
  { word: 'basket', emoji: '🧺', clue: 'You carry shopping in it', wrongs: ['baskit', 'baskut'], hint: 'bask + <b>et</b> 🧺' },
  { word: 'bridge', emoji: '🌉', clue: 'You cross a river on it', wrongs: ['brige', 'bridj'], hint: 'a sneaky <b>d</b> hides in bri-DGE 🌉' },
  { word: 'button', emoji: '🔘', clue: 'You fasten your coat with it', wrongs: ['buton', 'buttun'], hint: 'double <b>t</b>: bu-TT-on 🔘' },
  { word: 'carrot', emoji: '🥕', clue: 'An orange vegetable rabbits love', wrongs: ['carot', 'carrut'], hint: 'double <b>r</b>, one t: ca-RR-ot 🥕' },
  { word: 'cherry', emoji: '🍒', clue: 'A small round red fruit on a stalk', wrongs: ['chery', 'cherri'], hint: 'double <b>r</b> and a <b>y</b>: che-RR-y 🍒' },
  { word: 'circle', emoji: '⭕', clue: 'A perfectly round shape', wrongs: ['circel', 'sircle'], hint: 'two c\'s with different sounds: CIR-cle ⭕' },
  { word: 'corner', emoji: '📐', clue: 'Where two walls meet', wrongs: ['cornor', 'cornur'], hint: 'corn + <b>er</b> 📐' },
  { word: 'dolphin', emoji: '🐬', clue: 'A clever sea animal that clicks', wrongs: ['dolfin', 'dolphen'], hint: '<b>ph</b> makes the F sound: dol-PH-in 🐬' },
  { word: 'donkey', emoji: '🐴', clue: 'It says ee-aw!', wrongs: ['donky', 'dunkey'], hint: 'it ends in <b>ey</b> like monkey! 🐴' },
  { word: 'finger', emoji: '☝️', clue: 'You point with it', wrongs: ['fingur', 'finguh'], hint: 'fing + <b>er</b> ☝️' },
  { word: 'flower', emoji: '🌸', clue: 'It grows in the garden and smells lovely', wrongs: ['flouer', 'flowur'], hint: 'fl-<b>ow</b>-er — OW in the middle 🌸' },
  { word: 'forest', emoji: '🌲', clue: 'A huge wood full of trees', wrongs: ['forrest', 'forist'], hint: 'only ONE <b>r</b>: fo-r-est 🌲' },
  { word: 'grass', emoji: '🌱', clue: 'Green stuff you walk on in the park', wrongs: ['gras', 'grase'], hint: 'double <b>s</b> at the end: gra-SS 🌱' },
  { word: 'horse', emoji: '🐎', clue: 'You can ride it at the stables', wrongs: ['hors', 'horce'], hint: 'it ends with a silent <b>e</b>: hor-SE 🐎' },
  { word: 'lemon', emoji: '🍋', clue: 'A sour yellow fruit', wrongs: ['lemmon', 'lemun'], hint: 'one <b>m</b>: le-m-on 🍋' },
  { word: 'letter', emoji: '✉️', clue: 'You post it in an envelope', wrongs: ['leter', 'lettur'], hint: 'double <b>t</b>: le-TT-er ✉️' },
  { word: 'lunch', emoji: '🥪', clue: 'The meal in the middle of the day', wrongs: ['lunsh', 'lonch'], hint: 'it ends in <b>ch</b>: lun-CH 🥪' },
  { word: 'mirror', emoji: '🪞', clue: 'You see yourself in it', wrongs: ['miror', 'mirrer'], hint: 'double <b>r</b> in the middle AND or at the end: mi-RR-or 🪞' },
  { word: 'morning', emoji: '🌞', clue: 'The start of the day', wrongs: ['morming', 'morening'], hint: 'morn + <b>ing</b> 🌞' },
  { word: 'number', emoji: '🔢', clue: 'You count with these', wrongs: ['numbur', 'nomber'], hint: 'num + <b>ber</b> 🔢' },
  { word: 'orange', emoji: '🍊', clue: 'A fruit that shares its name with a colour', wrongs: ['orenge', 'ornage'], hint: 'or-<b>a</b>-nge — an A hides in the middle 🍊' },
  { word: 'paper', emoji: '📄', clue: 'You draw and write on it', wrongs: ['papper', 'payper'], hint: 'just ONE <b>p</b> in the middle: pa-p-er 📄' },
  { word: 'picnic', emoji: '🧺', clue: 'Eating outside on a blanket', wrongs: ['picnick', 'piknic'], hint: 'two c\'s, no k: pi-C-ni-C 🧺' },
  { word: 'picture', emoji: '🖼️', clue: 'A drawing or photo on the wall', wrongs: ['pictcher', 'pikture'], hint: 'pic + <b>ture</b> 🖼️' },
  { word: 'pirate', emoji: '🏴‍☠️', clue: 'A sailor who hunts for treasure', wrongs: ['pirat', 'pyrate'], hint: 'pir-<b>ate</b> — it ends in ATE 🏴‍☠️' },
  { word: 'pocket', emoji: '👖', clue: 'A little bag sewn into your clothes', wrongs: ['pockit', 'poket'], hint: '<b>ck</b> together: po-CK-et 👖' },
  { word: 'present', emoji: '🎁', clue: 'You unwrap it on your birthday', wrongs: ['presant', 'prezent'], hint: 'pres + <b>ent</b> 🎁' },
  { word: 'purple', emoji: '💜', clue: 'The colour of grapes and plums', wrongs: ['perple', 'purpel'], hint: 'p-<b>ur</b>-ple, ends in LE 💜' },
  { word: 'puppy', emoji: '🐶', clue: 'A baby dog', wrongs: ['pupy', 'puppey'], hint: 'double <b>p</b> in the middle: pu-PP-y 🐶' },
  { word: 'river', emoji: '🏞️', clue: 'Water that flows down to the sea', wrongs: ['rivver', 'rivur'], hint: 'one <b>v</b>: ri-v-er 🏞️' },
  { word: 'ruler', emoji: '📏', clue: 'You draw straight lines with it', wrongs: ['rular', 'rooler'], hint: 'rule + <b>r</b> 📏' },
  { word: 'sandwich', emoji: '🥙', clue: 'Two slices of bread with a filling', wrongs: ['sandwitch', 'sanwich'], hint: 'sand + <b>wich</b> — no T! 🥙' },
  { word: 'seven', emoji: '7️⃣', clue: 'One more than six', wrongs: ['sevin', 'sevven'], hint: 'se-v-<b>en</b> — one v 7️⃣' },
  { word: 'shadow', emoji: '👤', clue: 'It follows you on a sunny day', wrongs: ['shaddow', 'shadoe'], hint: 'one <b>d</b> and OW at the end: sha-d-OW 👤' },
  { word: 'silver', emoji: '🥈', clue: 'The shiny grey colour of coins', wrongs: ['silvur', 'selver'], hint: 'sil + <b>ver</b> 🥈' },
  { word: 'spoon', emoji: '🥄', clue: 'You eat soup with it', wrongs: ['spune', 'spoone'], hint: 'double <b>o</b>: sp-OO-n 🥄' },
  { word: 'sugar', emoji: '🍭', clue: 'It makes things taste sweet', wrongs: ['suger', 'shugar'], hint: 'the <b>s</b> sounds like SH: Su-gar 🍭' },
  { word: 'table', emoji: '🍽️', clue: 'You eat your dinner at it', wrongs: ['tabel', 'tayble'], hint: 'it ends in <b>le</b>: ta-b-LE 🍽️' },
  { word: 'teacher', emoji: '🧑‍🏫', clue: 'They help you learn at school', wrongs: ['teecher', 'teachur'], hint: 't-<b>ea</b>-cher — TEA hides inside! 🧑‍🏫' },
  { word: 'ticket', emoji: '🎟️', clue: 'You need one to ride the train', wrongs: ['tickit', 'ticet'], hint: '<b>ck</b> together: ti-CK-et 🎟️' },
  { word: 'tractor', emoji: '🚜', clue: 'A farm machine with big wheels', wrongs: ['tracter', 'traktor'], hint: 'it ends in <b>or</b>: tract-OR 🚜' },
  { word: 'turtle', emoji: '🐢', clue: 'A slow animal with a shell that swims', wrongs: ['tertle', 'turtel'], hint: 't-<b>ur</b>-tle, ends in LE 🐢' },
  { word: 'uncle', emoji: '🧔', clue: 'Your mum or dad\'s brother', wrongs: ['uncel', 'unkle'], hint: 'the <b>c</b> sounds like K: un-C-le 🧔' },
  { word: 'village', emoji: '🏘️', clue: 'A tiny town in the countryside', wrongs: ['vilage', 'villige'], hint: 'double <b>l</b> and AGE at the end: vi-LL-age 🏘️' },
  { word: 'window', emoji: '🪟', clue: 'You look outside through it', wrongs: ['windoe', 'windew'], hint: 'OW at the end: wind-OW 🪟' },
  { word: 'wizard', emoji: '🧙', clue: 'A man who casts magic spells', wrongs: ['wizzard', 'wizerd'], hint: 'one <b>z</b>: wi-z-ard 🧙' },
  { word: 'zebra', emoji: '🦓', clue: 'A stripy black-and-white animal', wrongs: ['zeebra', 'zebrah'], hint: 'ze-<b>bra</b> — just 5 letters! 🦓' },
  { word: 'ladder', emoji: '🪜', clue: 'You climb it to reach high places', wrongs: ['lader', 'laddur'], hint: 'double <b>d</b>: la-DD-er 🪜' },
  { word: 'kitten', emoji: '🐱', clue: 'A baby cat', wrongs: ['kiten', 'kittin'], hint: 'double <b>t</b>: ki-TT-en 🐱' },
  { word: 'jacket', emoji: '🧥', clue: 'You wear it when it\'s chilly', wrongs: ['jackit', 'jaket'], hint: '<b>ck</b> together: ja-CK-et 🧥' },
  { word: 'honey', emoji: '🍯', clue: 'Bees make this sweet golden food', wrongs: ['huney', 'honny'], hint: 'h-<b>o</b>-ney, ends in EY 🍯' },
  { word: 'grape', emoji: '🍇', clue: 'A small fruit that grows in bunches', wrongs: ['graip', 'grap'], hint: 'silent <b>e</b> at the end makes the A say its name 🍇' },
  { word: 'eleven', emoji: '🕚', clue: 'One more than ten', wrongs: ['elevin', 'elevven'], hint: 'e-le-v-<b>en</b> — three e\'s! 🕚' },
  { word: 'cousin', emoji: '👫', clue: 'Your aunt and uncle\'s child', wrongs: ['cuzin', 'cousen'], hint: '<b>ou</b> hides inside: c-OU-sin 👫' },
  { word: 'doctor', emoji: '🩺', clue: 'They help you when you\'re poorly', wrongs: ['docter', 'dokter'], hint: 'it ends in <b>or</b>: doct-OR 🩺' },
  { word: 'dinosaur', emoji: '🦕', clue: 'A giant animal from long, long ago', wrongs: ['dinosor', 'dinasaur'], hint: 'dino-<b>saur</b> — s-a-u-r 🦕' },
  { word: 'elephant', emoji: '🐘', clue: 'The biggest land animal, with a trunk', wrongs: ['elefant', 'eliphant'], hint: '<b>ph</b> makes the F sound: ele-PH-ant 🐘' },
  { word: 'balloon', emoji: '🎈', clue: 'You blow it up for a party', wrongs: ['baloon', 'ballon'], hint: 'double <b>l</b> AND double <b>o</b>: ba-LL-OO-n 🎈' },
  { word: 'biscuit', emoji: '🍪', clue: 'A crunchy treat with your milk', wrongs: ['biskit', 'biscit'], hint: 'a silent <b>u</b> hides inside: bis-CU-it 🍪' },
  { word: 'blanket', emoji: '🛏️', clue: 'It keeps you warm in bed', wrongs: ['blankit', 'blancket'], hint: 'blank + <b>et</b> 🛏️' },
  { word: 'breakfast', emoji: '🥣', clue: 'The first meal of the day', wrongs: ['brekfast', 'breckfast'], hint: 'you <b>BREAK</b> your <b>FAST</b> in the morning! 🥣' },
  { word: 'butterfly', emoji: '🦋', clue: 'A pretty insect with colourful wings', wrongs: ['buterfly', 'butterflie'], hint: '<b>butter</b> + <b>fly</b> 🦋' },
];

const SPELL_TRICKY = [
  { word: 'friend', emoji: '🫶', clue: 'Someone you love to play with', wrongs: ['freind', 'frend'], hint: 'fri<b>END</b> has END in it — a friend to the END! 🫶' },
  { word: 'because', emoji: '🤔', clue: 'The word that gives a reason', wrongs: ['becuase', 'becos'], hint: '<b>B</b>ig <b>E</b>lephants <b>C</b>an <b>A</b>lways <b>U</b>nderstand <b>S</b>mall <b>E</b>lephants! 🐘' },
  { word: 'school', emoji: '🏫', clue: 'Where you go to learn', wrongs: ['scool', 'skool'], hint: 's-<b>ch</b>-ool — the h hides after the c! 🏫' },
  { word: 'beautiful', emoji: '🌸', clue: 'Very, very pretty', wrongs: ['butiful', 'beautifull'], hint: '<b>B</b>ig <b>E</b>ars <b>A</b>ren\'t <b>U</b>gly — b-e-a-u, then one l! 🌸' },
  { word: 'favourite', emoji: '💖', clue: 'The one you like best of all', wrongs: ['favrite', 'faverite'], hint: 'fav-<b>OUR</b>-ite — OUR favourite! 💖' },
  { word: 'different', emoji: '🔀', clue: 'Not the same', wrongs: ['diffrent', 'diferent'], hint: 'double <b>f</b> and a hidden <b>e</b>: diff-er-ent 🔀' },
  { word: 'people', emoji: '👥', clue: 'Lots of humans together', wrongs: ['peple', 'peopel'], hint: 'pe-<b>o</b>-ple — the o sneaks in! 👥' },
  { word: 'thought', emoji: '💭', clue: 'An idea inside your head', wrongs: ['thort', 'thaught'], hint: 'th + <b>ought</b> — o-u-g-h-t 💭' },
  { word: 'enough', emoji: '👍', clue: 'As much as you need', wrongs: ['enuff', 'enugh'], hint: '<b>ough</b> sounds like UFF: en-OUGH 👍' },
  { word: 'island', emoji: '🏝️', clue: 'Land with water all around it', wrongs: ['iland', 'eyeland'], hint: 'the <b>s</b> is silent — an IS-land IS land! 🏝️' },
  { word: 'chocolate', emoji: '🍫', clue: 'A sweet brown treat', wrongs: ['choclate', 'chocolat'], hint: 'choc-<b>o</b>-late — don\'t lose the middle o! 🍫' },
  { word: 'tomorrow', emoji: '🌅', clue: 'The day after today', wrongs: ['tomorow', 'tommorow'], hint: 'one <b>m</b>, double <b>r</b>: to-mo-rrow 🌅' },
  { word: 'minute', emoji: '⏱️', clue: 'Sixty seconds', wrongs: ['minit', 'minnit'], hint: 'min-<b>ute</b> — it ends like flute! ⏱️' },
  { word: 'believe', emoji: '🌟', clue: 'To feel sure something is true', wrongs: ['beleive', 'beleve'], hint: 'never be<b>LIE</b>ve a LIE! 🌟' },
  { word: 'straight', emoji: '➡️', clue: 'A line with no bends', wrongs: ['strait', 'strate'], hint: 'str-<b>aight</b> — a-i-g-h-t ➡️' },
  { word: 'caught', emoji: '🥎', clue: 'You did this when the ball landed in your hands', wrongs: ['cort', 'caugt'], hint: 'c-<b>augh</b>-t — the gh is silent! 🥎' },
  { word: 'early', emoji: '🌄', clue: 'Before the usual time', wrongs: ['erly', 'earley'], hint: '<b>ear</b>-ly — it starts with EAR! 🌄' },
  { word: 'heart', emoji: '❤️', clue: 'It beats inside your chest', wrongs: ['hart', 'heert'], hint: 'you <b>HEAR</b> with your HEART! ❤️' },
  { word: 'often', emoji: '🔁', clue: 'Happening lots of times', wrongs: ['offen', 'ofen'], hint: 'of-<b>t</b>-en — the t hides in the middle! 🔁' },
  { word: 'knight', emoji: '🛡️', clue: 'A soldier in shining armour', wrongs: ['nite', 'knite'], hint: 'silent <b>k</b>: K-night guards the night! 🛡️' },
  { word: 'castle', emoji: '🏰', clue: 'Where a king and queen live', wrongs: ['casel', 'cassle'], hint: 'silent <b>t</b>: cas-T-le 🏰' },
  { word: 'answer', emoji: '✅', clue: 'What you give when asked a question', wrongs: ['anser', 'ansewr'], hint: 'silent <b>w</b>: ans-W-er ✅' },
  { word: 'surprise', emoji: '🎁', clue: 'Something you never expected', wrongs: ['suprise', 'surprize'], hint: 'su-<b>r</b>-prise — two r\'s, and an s at the end! 🎁' },
  { word: 'earth', emoji: '🌍', clue: 'The planet we live on', wrongs: ['erth', 'urth'], hint: '<b>ear</b>-th — it starts with EAR! 🌍' },
  { word: 'accident', emoji: '🤕', clue: 'Something that goes wrong by mistake', wrongs: ['acident', 'axident'], hint: 'double <b>c</b>: a-CC-ident 🤕' },
  { word: 'actually', emoji: '💬', clue: 'A word that means "really and truly"', wrongs: ['actualy', 'acshually'], hint: '<b>actual</b> + ly — double l at the join! 💬' },
  { word: 'address', emoji: '🏠', clue: 'Your house number and street name', wrongs: ['adress', 'addres'], hint: 'double <b>d</b> AND double <b>s</b>: a-DD-re-SS 🏠' },
  { word: 'although', emoji: '🤷', clue: 'A fancy word for "even though"', wrongs: ['altho', 'allthough'], hint: '<b>al</b> + though — only one l! 🤷' },
  { word: 'appear', emoji: '👻', clue: 'To suddenly pop into view', wrongs: ['apear', 'appeer'], hint: 'double <b>p</b>, then EAR: a-PP-ear 👻' },
  { word: 'arrive', emoji: '🚗', clue: 'To get to the place you\'re going', wrongs: ['arive', 'arrived'], hint: 'double <b>r</b>: a-RR-ive 🚗' },
  { word: 'bicycle', emoji: '🚲', clue: 'It has two wheels and pedals', wrongs: ['bicicle', 'bycicle'], hint: 'bi-<b>CY</b>-cle — the Y rides in the middle! 🚲' },
  { word: 'breath', emoji: '😮‍💨', clue: 'The air you take in through your nose', wrongs: ['breth', 'briath'], hint: 'br-<b>ea</b>-th — EA in the middle 😮‍💨' },
  { word: 'build', emoji: '🏗️', clue: 'To make something out of bricks or blocks', wrongs: ['bild', 'buld'], hint: 'a silent <b>u</b> first: b-U-ild 🏗️' },
  { word: 'busy', emoji: '🐝', clue: 'Having lots and lots to do', wrongs: ['bizzy', 'bussy'], hint: 'the <b>u</b> sounds like I — busy as a bee: b-U-sy 🐝' },
  { word: 'calendar', emoji: '📅', clue: 'It shows all the days and months', wrongs: ['calender', 'calandar'], hint: 'it ends in <b>dar</b>: calen-DAR 📅' },
  { word: 'centre', emoji: '🎯', clue: 'The exact middle of something', wrongs: ['centr', 'sentre'], hint: 'it ends in <b>re</b>: cent-RE 🎯' },
  { word: 'certain', emoji: '✔️', clue: 'Completely sure about something', wrongs: ['sertain', 'certin'], hint: 'cert-<b>ain</b> — AIN at the end ✔️' },
  { word: 'chimney', emoji: '🎅', clue: 'Smoke goes up through it from the fire', wrongs: ['chimny', 'chimley'], hint: 'chim-<b>ney</b> — NEY at the end 🎅' },
  { word: 'complete', emoji: '✅', clue: 'Totally finished, nothing missing', wrongs: ['compleet', 'complet'], hint: 'com-pl-<b>ete</b> — silent e at the end ✅' },
  { word: 'continue', emoji: '▶️', clue: 'To keep on going', wrongs: ['continu', 'contineu'], hint: 'contin-<b>ue</b> — UE at the end ▶️' },
  { word: 'decide', emoji: '⚖️', clue: 'To make up your mind', wrongs: ['deside', 'decid'], hint: 'the <b>c</b> sounds like S: de-CIDE ⚖️' },
  { word: 'describe', emoji: '📝', clue: 'To say what something is like', wrongs: ['discribe', 'describ'], hint: '<b>de</b>-scribe, not di — and a silent e 📝' },
  { word: 'difficult', emoji: '😤', clue: 'Really hard to do', wrongs: ['dificult', 'difficalt'], hint: 'double <b>f</b>: di-FF-icult 😤' },
  { word: 'disappear', emoji: '🫥', clue: 'To vanish from sight', wrongs: ['dissapear', 'disapear'], hint: '<b>dis</b> + <b>appear</b> — one s, double p! 🫥' },
  { word: 'eight', emoji: '8️⃣', clue: 'One more than seven', wrongs: ['aight', 'eigth'], hint: 'e-i-g-h-t — the <b>gh</b> is silent! 8️⃣' },
  { word: 'exercise', emoji: '🏃', clue: 'Running and jumping to stay healthy', wrongs: ['excercise', 'exersize'], hint: 'no c after x: e-<b>xer</b>-cise 🏃' },
  { word: 'experiment', emoji: '🧪', clue: 'A test a scientist does to find something out', wrongs: ['experament', 'expiriment'], hint: 'exper-<b>i</b>-ment — i in the middle 🧪' },
  { word: 'extreme', emoji: '🌋', clue: 'The very, very most of something', wrongs: ['extreem', 'extream'], hint: 'extr-<b>eme</b> — e-m-e at the end 🌋' },
  { word: 'famous', emoji: '🌟', clue: 'Known by everyone everywhere', wrongs: ['famus', 'famouse'], hint: 'fam-<b>ous</b> — OUS at the end, no e! 🌟' },
  { word: 'february', emoji: '❄️', clue: 'The shortest month of the year', wrongs: ['febuary', 'februry'], hint: 'don\'t lose the first R: Feb-<b>RU</b>-ary ❄️' },
  { word: 'forward', emoji: '➡️', clue: 'The opposite of backward', wrongs: ['foward', 'forwerd'], hint: '<b>for</b> + <b>ward</b> — keep both r\'s ➡️' },
  { word: 'fruit', emoji: '🍓', clue: 'Apples, bananas and berries are all this', wrongs: ['froot', 'fruite'], hint: 'a silent <b>i</b> hides inside: fr-UI-t 🍓' },
  { word: 'grammar', emoji: '📚', clue: 'The rules for putting words together', wrongs: ['grammer', 'gramar'], hint: 'double <b>m</b> and AR at the end: gra-MM-ar 📚' },
  { word: 'group', emoji: '👨‍👩‍👧‍👦', clue: 'A bunch of people together', wrongs: ['groop', 'grupe'], hint: '<b>ou</b> makes the OO sound: gr-OU-p 👨‍👩‍👧‍👦' },
  { word: 'guard', emoji: '💂', clue: 'A person who keeps something safe', wrongs: ['gard', 'gaurd'], hint: 'silent <b>u</b> after the g: g-UA-rd 💂' },
  { word: 'guess', emoji: '🎲', clue: 'Your best try when you don\'t know the answer', wrongs: ['gess', 'guese'], hint: 'silent <b>u</b> and double <b>s</b>: g-U-e-SS 🎲' },
  { word: 'guide', emoji: '🧭', clue: 'Someone who shows you the way', wrongs: ['gide', 'guied'], hint: 'silent <b>u</b> after the g: g-U-ide 🧭' },
  { word: 'half', emoji: '🌓', clue: 'One of two equal pieces', wrongs: ['haf', 'harf'], hint: 'a silent <b>l</b> hides inside: ha-L-f 🌓' },
  { word: 'heard', emoji: '👂', clue: 'What your ears just did', wrongs: ['hurd', 'heared'], hint: 'you hear with your <b>EAR</b> — h-EAR-d! 👂' },
  { word: 'height', emoji: '📏', clue: 'How tall something is', wrongs: ['hight', 'heigth'], hint: 'e-i-g-h-t like <b>eight</b>: h-EIGHT 📏' },
  { word: 'history', emoji: '🏛️', clue: 'Stories about things that happened long ago', wrongs: ['histroy', 'histery'], hint: 'his-<b>tor</b>-y — his STORY! 🏛️' },
  { word: 'hour', emoji: '⏰', clue: 'Sixty minutes', wrongs: ['ower', 'howr'], hint: 'it starts with a silent <b>h</b>: H-our ⏰' },
  { word: 'imagine', emoji: '💭', clue: 'To make a picture in your mind', wrongs: ['imagin', 'immagine'], hint: 'one m, and an <b>e</b> at the end: imagin-E 💭' },
  { word: 'important', emoji: '❗', clue: 'Something that really matters', wrongs: ['importent', 'inportant'], hint: 'im-port-<b>ant</b> — ANT at the end ❗' },
  { word: 'interest', emoji: '🤓', clue: 'Wanting to know more about something', wrongs: ['intrest', 'interist'], hint: 'in-<b>ter</b>-est — don\'t squash the middle! 🤓' },
  { word: 'january', emoji: '🎆', clue: 'The first month of the year', wrongs: ['janury', 'jannuary'], hint: 'jan-<b>u</b>-ary — the u comes first 🎆' },
  { word: 'juice', emoji: '🧃', clue: 'A drink squeezed from fruit', wrongs: ['joose', 'juce'], hint: 'j-<b>UI</b>-ce — UI in the middle 🧃' },
  { word: 'knee', emoji: '🦵', clue: 'Your leg bends here', wrongs: ['nee', 'knea'], hint: 'silent <b>k</b>: K-nee 🦵' },
  { word: 'knife', emoji: '🔪', clue: 'You cut your food with it', wrongs: ['nife', 'knif'], hint: 'silent <b>k</b> and silent <b>e</b>: K-nif-E 🔪' },
  { word: 'knock', emoji: '👊', clue: 'What you do on a door', wrongs: ['nock', 'knok'], hint: 'silent <b>k</b> at the start, ck at the end: K-no-CK 👊' },
  { word: 'laugh', emoji: '😂', clue: 'What you do when something is funny', wrongs: ['laf', 'larf'], hint: '<b>augh</b> sounds like AFF: l-AUGH 😂' },
  { word: 'library', emoji: '📖', clue: 'A building full of books to borrow', wrongs: ['libary', 'librery'], hint: 'keep the first R: lib-<b>RAR</b>-y 📖' },
  { word: 'listen', emoji: '🎧', clue: 'What you do with your ears', wrongs: ['lissen', 'lisen'], hint: 'a silent <b>t</b> hides inside: lis-T-en 🎧' },
  { word: 'material', emoji: '🧵', clue: 'What something is made from', wrongs: ['materiel', 'matirial'], hint: 'mat-er-i-<b>al</b> — AL at the end 🧵' },
  { word: 'medicine', emoji: '💊', clue: 'You take it to feel better', wrongs: ['medicin', 'medisine'], hint: 'medi-<b>cine</b> — the c sounds like S 💊' },
  { word: 'mention', emoji: '🗣️', clue: 'To talk about something quickly', wrongs: ['menshun', 'mension'], hint: '<b>tion</b> makes the SHUN sound: men-TION 🗣️' },
  { word: 'naughty', emoji: '😈', clue: 'Being a little bit bad', wrongs: ['norty', 'naugty'], hint: 'n-<b>augh</b>-ty — a-u-g-h 😈' },
  { word: 'necessary', emoji: '📋', clue: 'Something you really must have or do', wrongs: ['neccessary', 'necesary'], hint: 'one collar, two sleeves: one <b>C</b>, two <b>S</b>\'s! 📋' },
  { word: 'neighbour', emoji: '🏡', clue: 'The person who lives next door', wrongs: ['naybour', 'nieghbour'], hint: '<b>eigh</b> like eight: n-EIGH-bour 🏡' },
  { word: 'notice', emoji: '👀', clue: 'To spot something with your eyes', wrongs: ['notise', 'notic'], hint: 'not-<b>ice</b> — ICE at the end! 👀' },
  { word: 'occasion', emoji: '🎉', clue: 'A special day or event', wrongs: ['ocassion', 'occassion'], hint: 'double <b>c</b>, one <b>s</b>: o-CC-a-S-ion 🎉' },
  { word: 'opposite', emoji: '↔️', clue: 'Hot is this to cold', wrongs: ['oposite', 'opposit'], hint: 'double <b>p</b> and an e at the end: o-PP-osit-E ↔️' },
  { word: 'ordinary', emoji: '😐', clue: 'Plain and normal, nothing special', wrongs: ['ordinery', 'ordanary'], hint: 'ordin-<b>ary</b> — ARY at the end 😐' },
  { word: 'peculiar', emoji: '🤪', clue: 'Strange and a little bit odd', wrongs: ['peculier', 'perculiar'], hint: 'pec-<b>u</b>-li-<b>ar</b> — AR at the end 🤪' },
  { word: 'perhaps', emoji: '🤔', clue: 'A fancy word for "maybe"', wrongs: ['perhapps', 'prehaps'], hint: '<b>per</b> + <b>haps</b> 🤔' },
  { word: 'position', emoji: '📍', clue: 'The exact spot where something is', wrongs: ['posision', 'possition'], hint: 'one s, then <b>tion</b>: po-S-i-TION 📍' },
  { word: 'possible', emoji: '👍', clue: 'Something that CAN be done', wrongs: ['possable', 'posible'], hint: 'double <b>s</b> and IBLE: po-SS-ible 👍' },
  { word: 'potatoes', emoji: '🥔', clue: 'Chips and mash are made from these', wrongs: ['potatos', 'potatoe'], hint: 'one potato, lots of potat-<b>OES</b>! 🥔' },
  { word: 'pressure', emoji: '💨', clue: 'A strong push on something', wrongs: ['presure', 'preshure'], hint: 'double <b>s</b>: pre-SS-ure 💨' },
  { word: 'probably', emoji: '🎯', clue: 'Very likely to happen', wrongs: ['probly', 'probaly'], hint: 'prob-<b>ab</b>-ly — don\'t skip the middle! 🎯' },
  { word: 'promise', emoji: '🤝', clue: 'When you say you will definitely do it', wrongs: ['promiss', 'promice'], hint: 'prom-<b>ise</b> — ISE at the end 🤝' },
  { word: 'purpose', emoji: '🎯', clue: 'The reason something is done', wrongs: ['purpos', 'perpose'], hint: 'p-<b>ur</b>-pose, silent e at the end 🎯' },
  { word: 'quarter', emoji: '🕒', clue: 'One of four equal pieces', wrongs: ['quater', 'qaurter'], hint: '<b>QUART</b> + er — keep the r! 🕒' },
  { word: 'question', emoji: '❓', clue: 'You ask one to find something out', wrongs: ['queston', 'qestion'], hint: 'qu-es-<b>tion</b> — TION at the end ❓' },
  { word: 'queue', emoji: '🚶', clue: 'A line of people waiting their turn', wrongs: ['que', 'qew'], hint: 'Q then <b>UEUE</b> — the letters wait in line too! 🚶' },
  { word: 'regular', emoji: '🔁', clue: 'Happening again and again, on time', wrongs: ['reguler', 'regulor'], hint: 'reg-u-l-<b>ar</b> — AR at the end 🔁' },
  { word: 'remember', emoji: '🧠', clue: 'To keep something in your brain', wrongs: ['remeber', 'rember'], hint: 're-<b>mem</b>-ber — don\'t forget the middle mem! 🧠' },
  { word: 'restaurant', emoji: '🍽️', clue: 'A place where you pay to eat dinner', wrongs: ['resturant', 'restarant'], hint: 'rest-<b>au</b>-rant — AU hides in the middle 🍽️' },
  { word: 'rhyme', emoji: '🎤', clue: 'Cat and hat do this', wrongs: ['rime', 'ryme'], hint: 'a silent <b>h</b> after the r: r-H-yme 🎤' },
  { word: 'rhythm', emoji: '🥁', clue: 'The beat you clap along to', wrongs: ['rythm', 'rhythem'], hint: '<b>R</b>hythm <b>H</b>elps <b>Y</b>our <b>T</b>wo <b>H</b>ips <b>M</b>ove! 🥁' },
  { word: 'sentence', emoji: '✏️', clue: 'A whole line of words ending with a full stop', wrongs: ['sentance', 'sentense'], hint: 'sent-<b>ence</b> — ENCE at the end ✏️' },
  { word: 'separate', emoji: '✂️', clue: 'To split things apart', wrongs: ['seperate', 'separete'], hint: 'there\'s <b>A RAT</b> in sep-A-RAT-e! ✂️' },
  { word: 'soldier', emoji: '🪖', clue: 'A brave person in the army', wrongs: ['soljer', 'soldgier'], hint: 'sol-<b>di</b>-er — the DI sounds like J! 🪖' },
  { word: 'special', emoji: '⭐', clue: 'Extra wonderful, one of a kind', wrongs: ['speshal', 'specail'], hint: '<b>ci</b> makes the SH sound: spe-CI-al ⭐' },
  { word: 'stomach', emoji: '😋', clue: 'Your food goes down into it', wrongs: ['stumach', 'stomack'], hint: 'it ends in <b>ach</b>: stom-ACH 😋' },
  { word: 'strange', emoji: '👽', clue: 'Weird and unusual', wrongs: ['strang', 'stranje'], hint: 'stran-<b>ge</b> — the silent e makes the g soft 👽' },
  { word: 'strength', emoji: '💪', clue: 'How strong you are', wrongs: ['strenth', 'strengh'], hint: 'stren-<b>gth</b> — g, t AND h at the end! 💪' },
  { word: 'suppose', emoji: '💭', clue: 'To think something is probably true', wrongs: ['supose', 'suppos'], hint: 'double <b>p</b>: su-PP-ose 💭' },
  { word: 'therefore', emoji: '➡️', clue: 'A fancy word for "and so..."', wrongs: ['therefor', 'therfore'], hint: '<b>there</b> + <b>fore</b> — two silent e\'s! ➡️' },
  { word: 'though', emoji: '🤷', clue: 'A short word for "even so"', wrongs: ['tho', 'thogh'], hint: 'th-<b>ough</b> — o-u-g-h 🤷' },
  { word: 'through', emoji: '🚪', clue: 'In one side and out the other', wrongs: ['thru', 'throught'], hint: 'thr-<b>ough</b> — o-u-g-h, no t at the end! 🚪' },
  { word: 'tongue', emoji: '👅', clue: 'It helps you taste and talk', wrongs: ['tung', 'tounge'], hint: 'it ends in <b>gue</b>: ton-GUE 👅' },
  { word: 'trouble', emoji: '⚠️', clue: 'What you\'re in when things go wrong', wrongs: ['truble', 'trubble'], hint: 'tr-<b>ou</b>-ble — OU in the middle ⚠️' },
  { word: 'weight', emoji: '⚖️', clue: 'How heavy something is', wrongs: ['wieght', 'wate'], hint: '<b>eigh</b> like eight: w-EIGH-t ⚖️' },
  { word: 'weird', emoji: '👾', clue: 'Strange in a spooky way', wrongs: ['wierd', 'weerd'], hint: 'WEIRD breaks the i-before-e rule — that\'s why it\'s weird! 👾' },
  { word: 'whole', emoji: '🍩', clue: 'All of it, with nothing missing', wrongs: ['whol', 'hwole'], hint: 'it starts with a silent <b>w</b>: W-hole 🍩' },
  { word: 'women', emoji: '👩‍👩‍👧', clue: 'More than one grown-up lady', wrongs: ['wimen', 'womans'], hint: 'one wom<b>A</b>n, two wom<b>E</b>n! 👩‍👩‍👧' },
];

function spellShuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Deal words from a shuffled deck so a round repeats as little as possible
const spellDecks = {};
function spellNextWord(bankName) {
  const bank = bankName === 'tricky' ? SPELL_TRICKY : SPELL_EASY;
  if (!spellDecks[bankName] || spellDecks[bankName].length === 0) {
    spellDecks[bankName] = spellShuffle(bank);
  }
  return spellDecks[bankName].pop();
}

// Read the word aloud (built-in browser speech, no dependencies)
function speakWord(word) {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.rate = 0.75;
    u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  } catch (e) { /* speech is a bonus, never break the game */ }
}

function spellSpeakBtn(word) {
  return `<button type="button" class="speak-word-btn" onclick="event.stopPropagation(); speakWord('${word}')">🔊 Hear it</button>`;
}

// --- My School Words: the parent-entered weekly spelling list ---
// Stored per player; managed from the Grown-Up Zone dashboard.
const SchoolWords = (() => {
  const KEY = 'space_quest_school_words_v1';
  function load() {
    try {
      const raw = localStorage.getItem(Players.key(KEY));
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) { return []; }
  }
  function save(words) {
    localStorage.setItem(Players.key(KEY), JSON.stringify(words));
    delete spellDecks.school; // list changed — reshuffle the deal
  }
  return { load, save };
})();

function schoolNextWord() {
  const words = SchoolWords.load();
  let deck = spellDecks.school;
  if (!deck || deck.length === 0 || deck.some(w => !words.includes(w))) {
    deck = spellDecks.school = spellShuffle(words);
  }
  return deck.pop();
}

// Corrupt a word the way kids actually misspell: phoneme swaps, dropped or
// doubled letters, transpositions. Used for school words, which have no
// hand-curated misspellings.
function generateMisspellings(word) {
  const w = word.toLowerCase();
  const cands = new Set();
  const subs = [
    ['ie', 'ei'], ['ei', 'ie'], ['ough', 'off'], ['igh', 'ite'], ['ph', 'f'],
    ['ck', 'k'], ['qu', 'kw'], ['ee', 'ea'], ['ea', 'ee'], ['ai', 'ay'],
    ['c', 'k'], ['c', 's'], ['s', 'c'], ['y', 'i'], ['i', 'y'],
    ['er', 'ur'], ['or', 'er'], ['le', 'el'], ['oo', 'u'], ['tion', 'shun']
  ];
  subs.forEach(([a, b]) => {
    if (w.includes(a)) {
      const m = w.replace(a, b);
      if (m !== w) cands.add(m);
    }
  });
  const undoubled = w.replace(/(.)\1/, '$1');
  if (undoubled !== w) cands.add(undoubled);
  for (let i = 1; i < w.length - 1; i++) {
    if (!'aeiou'.includes(w[i]) && w[i - 1] !== w[i] && w[i + 1] !== w[i]) {
      cands.add(w.slice(0, i + 1) + w[i] + w.slice(i + 1));
      break;
    }
  }
  for (let i = 1; i < w.length - 2; i++) {
    if (w[i] !== w[i + 1]) {
      cands.add(w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2));
      break;
    }
  }
  cands.delete(w);
  // Crude fallbacks (drop/double the last letter) only if we're short
  if (cands.size < 2) {
    if (w.length > 3) cands.add(w.slice(0, -1));
    cands.add(w + w[w.length - 1]);
    cands.delete(w);
  }
  return spellShuffle([...cands]).slice(0, 2);
}

function buildSchoolWordQuestion() {
  const word = schoolNextWord();
  const teach = `The correct spelling is <b>${word}</b> — one more look, you've got this! 🏫`;
  // Half tile-building (hear it, spell it — like a real spelling test),
  // half spot-the-spelling with generated misspellings.
  if (Math.random() < 0.5) {
    return {
      op: 'spelling',
      spellWord: word.toUpperCase(),
      html: `<div class="prompt-line">🏫 One of YOUR school words!</div><div class="prompt-line story-which-op">Listen, then tap the letters in order! ${spellSpeakBtn(word)}</div>`,
      promptText: word,
      expected: word,
      teach
    };
  }
  const opts = spellShuffle([word, ...generateMisspellings(word)]);
  return {
    op: 'spelling',
    html: `<div class="prompt-line">🏫 One of YOUR school words!</div><div class="prompt-line story-which-op">Which spelling is correct? ${spellSpeakBtn(word)}</div>`,
    choices: opts.map(o => ({ html: o, value: o })),
    promptText: `spell "${word}"`,
    expected: word,
    teach
  };
}

function buildSpellingQuestion(level) {
  if (level === 'school') return buildSchoolWordQuestion();
  const tricky = level === 'spot2' || level === 'build2';
  const w = spellNextWord(tricky ? 'tricky' : 'easy');
  const teach = `The correct spelling is <b>${w.word}</b> — ${w.hint}`;

  if (level === 'build' || level === 'build2') {
    return {
      op: 'spelling',
      spellWord: w.word.toUpperCase(),
      html: `<div class="prompt-line">${w.emoji} ${w.clue}</div><div class="prompt-line story-which-op">Tap the letters in order to spell it! ${spellSpeakBtn(w.word)}</div>`,
      promptText: w.clue,
      expected: w.word,
      teach
    };
  }

  // spot: the correct word hides among kid-plausible misspellings
  const opts = spellShuffle([w.word, ...w.wrongs]);
  return {
    op: 'spelling',
    html: `<div class="prompt-line">${w.emoji} ${w.clue}</div><div class="prompt-line story-which-op">Which spelling is correct? ${spellSpeakBtn(w.word)}</div>`,
    choices: opts.map(o => ({ html: o, value: o })),
    promptText: `spell "${w.word}"`,
    expected: w.word,
    teach
  };
}
