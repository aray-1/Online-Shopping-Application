const seedrandom = require("seedrandom");

function numberToText(number){
    
    let textForm = "";
    let a = number;

    function twoDigitText(value){
        
        const singleDigits = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
        const teens = ["eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
        const tens = ["ten", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

        if((value>=20 || value === 10) && value%10===0) return tens[Math.floor(value/10)-1];
        else if(value>=20) return (tens[Math.floor(value/10)-1] + " " + singleDigits[value%10-1]);
        else if(value > 10 && value < 20) return teens[value-11];
        else if(value > 0) return singleDigits[value-1];
        return "";
    }

    if(number !== null && number !== undefined && number<9999999){
        let digits = [0, 0, 0, 0, 0, 0, 0];
        for(let i=6;i>=0;i--){
            digits[i] = a%10;
            a = Math.floor(a/10);
        }
        textForm += digits[0]*10 + digits[1] !== 0 ? twoDigitText(digits[0]*10 + digits[1]) + " lakh " : "";
        textForm += digits[2]*10 + digits[3] !== 0 ? twoDigitText(digits[2]*10 + digits[3]) + " thousand " : "";
        textForm += digits[4] !== 0 ? twoDigitText(digits[4]) + " hundred " : "";
        textForm += twoDigitText(digits[5]*10 + digits[6]) + " ";
        if(textForm === "") textForm = "zero ";
        return textForm;
    }
    return textForm;
}

function getRandomDiscount(maxPercent, itemID){
    const today = new Date();
    
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const seed = `${itemID} ${numberToText(Math.ceil(day/7))} ${numberToText(month)} ${numberToText(year)}`;
    
    const rng = seedrandom(seed);
    const randomPercent = Math.ceil(rng()*maxPercent);
    return randomPercent/100;
}

function randomID(length){
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*";
    let id = "";
    for(let i=0;i<length;i++) id+=characters[Math.floor(Math.random()*characters.length)];
    return id;
}

function getDate(){
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    return `${day}.${month}.${year}`;
}

module.exports = {
    numberToText,
    getRandomDiscount,
    randomID,
    getDate
}
