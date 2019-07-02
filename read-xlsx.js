'use strict';

const fs = require('fs');
const xlsx = require('xlsx');
const json2xls = require('json2xls');
const hangul = require('hangul-js');

(async () => {
    const workbook = xlsx.readFile('/Users/we/Workspace/node-work/hangul/cli/keywords.xlsx');
    let results = [];

    let hasMatchedKeyword = true;      // 매칭 키워드 포함 여부
    let dayInterval = 7;                // 날짜
    let maxDiffSyllabicCount = 2;       // 음절수 이하
    let maxDiffConsonantAndVowel = 4;   // 자소수 이하

    while(dayInterval--) {
        const sheet = workbook.SheetNames[dayInterval];
        const worksheet = workbook.Sheets[sheet];
        let datas = xlsx.utils.sheet_to_json(worksheet, {header: 1});
        let filteredCount = 0;
        datas.shift();  // Remove Header

        // 1단계: 음절 필터링
        datas = datas.filter((d) => {
            const searchKeyword = d[0].toString().replace(/\s/g, '').toLowerCase();
            const refindKeyword = d[1].toString().replace(/\s/g, '').toLowerCase();
            const diffSyllabicCount = Math.abs(searchKeyword.length - refindKeyword.length);

            // 음절
            if (diffSyllabicCount <= maxDiffSyllabicCount) {

                // 2단계: 자소분리 배열 추가
                const h1 = hangul.disassemble(searchKeyword);
                const h2 = hangul.disassemble(refindKeyword);
                let interval = Math.min(h1.length, h2.length);
                let cursor = 0;
                let diffConsonantAndVowel = 0;

                if (Math.abs(h1.length - h2.length) > maxDiffConsonantAndVowel) {
                    console.log(`Filtered [${searchKeyword}/${refindKeyword}/${diffSyllabicCount}]`);
                    filteredCount++;
                    return false;
                }

                while(interval--) {
                    if (h1[cursor] !== h2[cursor]) {
                        // console.log(`Diff ${h1[cursor]}/${h2[cursor]}`);
                        diffConsonantAndVowel++;
                    }

                    cursor++;
                }

                diffConsonantAndVowel = diffConsonantAndVowel + Math.abs(h1.length - h2.length);

                if (diffConsonantAndVowel > maxDiffConsonantAndVowel) {
                    console.log(`Filtered [${searchKeyword}/${refindKeyword}/${diffSyllabicCount}/${diffConsonantAndVowel}]`);
                    // console.log(`${h1.join(' ')}`);
                    // console.log(`${h2.join(' ')}`);
                    filteredCount++;
                    return false;
                } else {

                    if (diffSyllabicCount === 0 && diffConsonantAndVowel === 0) {
                        if (!hasMatchedKeyword) {
                            console.log(`Filtered [${searchKeyword}/${refindKeyword}/${diffSyllabicCount}/${diffConsonantAndVowel}]`);
                            return false;
                        }
                    }

                    // d.push([h1, h2]);
                    // d.push(sheet);
                    d.push(diffSyllabicCount);
                    d.push(diffConsonantAndVowel);
                    d.push(`day${dayInterval+1}`);
                    console.log(`Push [${searchKeyword}/${refindKeyword}/${diffSyllabicCount}/${diffConsonantAndVowel}]`);
                    // console.log(`${h1.join(' ')}`);
                    // console.log(`${h2.join(' ')}`);
                    return true;
                }
            } else {
                console.log(`Filtered [${searchKeyword}/${refindKeyword}/${diffSyllabicCount}]`);
                filteredCount++;
                return false;
            }
        });

        console.log(`[day${dayInterval+1}]Target Count: ${datas.length}`);
        console.log(`[day${dayInterval+1}]Filtered Count: ${filteredCount}`);
        console.log(`[day${dayInterval+1}]Total Count: ${datas.length + filteredCount}`);

        results = results.concat(datas);
    }

    // const xls = json2xls(results, {fields: ['Search Keyword', 'Refind Keyword', 'Day']});
    const xls = json2xls(results);
    await fs.writeFileSync(`/Users/we/Workspace/node-work/hangul/cli/result_keywrods.xlsx`, xls, 'binary');
    console.log(`Process End...`);
})();