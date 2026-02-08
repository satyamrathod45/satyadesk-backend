const generateJoinCode = (len) => {
    const codeChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
    let code = ""
    for(let i=0;i<len;i++) {
        const index = Math.floor(Math.random() * codeChar.length)
        code += codeChar[index];
    }
    return code;
}


export default generateJoinCode;