'use strict';

const hangulTest = require('hangul-js');

const h1 = hangulTest.disassemble('이하영 짱짱맨');
console.log(JSON.stringify(h1));

const h2 = hangulTest.assemble(['ㅇ', 'ㅣ', 'ㅎ', 'ㅏ', 'ㅇ', 'ㅕ', 'ㅇ']);
console.log(h2);

