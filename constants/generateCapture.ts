export function generateCapture(prev:string):string {
    const number = Math.floor(Math.random() * 6);
    const inputSmall = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
    ];
    const inputBig = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ];
    const pass1 = inputBig[number] + inputSmall[25 - number] + inputSmall[25 - number] + inputSmall[15 - number] + inputSmall[10 - number] + inputBig[16 - number];
    const pass2 = inputBig[16 - number] + inputSmall[15 - number] + inputSmall[10 - number] + inputBig[number] + inputSmall[25 - number] + inputSmall[25 - number];
    if (prev === pass1) {
        return pass2;
    } else {
        const pass3 = inputBig[8-number] + inputSmall[18 - number] + inputSmall[13 - number] + inputSmall[14 - number] + inputSmall[12 - number] + inputBig[24 - number];
        const pass4 = inputBig[18-number] + inputSmall[8 - number] + inputSmall[12 - number] + inputSmall[17 - number] + inputSmall[22 - number] + inputBig[14 - number];
        const secondRandom = Math.floor(Math.random() * 3);
        if (secondRandom === 0) {
            return pass4
        }else if (secondRandom == 1) {
            return pass3
        }else{
            return pass1
        }
    }
};
