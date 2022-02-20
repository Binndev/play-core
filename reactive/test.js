const main = require('./index')
const { reactive, effect } = main;

let temp1, temp2;

let data = {
    flag: 1,
    txt: 'lzb'
}

const obj = reactive(data);

effect(() => {
    console.log('effect1');
    effect(() => {
        console.log('effect2');
        temp2 = obj.txt;
    })
    temp1 = obj.flag;
})

obj.flag = 2;
// obj.txt = 'wry'
