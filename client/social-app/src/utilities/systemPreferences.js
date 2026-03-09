export const getColor = (index) => {
    const colors = ["rgb(55, 142, 223)", "rgb(106, 55, 223)", "rgb(26, 172, 123)", "rgb(255, 111, 97)"]
    return colors[index]
}

export const getWornColor = (index) => {
    const colors = ["rgba(55, 142, 223, .8)", "rgba(106, 55, 223, .8)", "rgba(26, 172, 123, .8)", "rgba(255, 111, 97, .8)"]
    return colors[index]
}

export const getMostWornOutColor = (index) => {
    const colors = ["rgba(55, 142, 223, .1)", "rgba(106, 55, 223, .1)",  "rgba(26, 172, 123, .1)", "rgba(255, 111, 97, .1)"]
    return colors[index]
}

export const getPreferenceBarColor = (index) => {
    const colors = ["rgb(160, 209, 255)", "rgb(182, 153, 252)", "rgb(172, 250, 224)", "rgb(255, 184, 177)"]
    return colors[index]
}

export const getFontSize = (index)=> {
    const sizes = {
        h1: ["1.5em", "1.75em", "2em", "2.5em", "3em"],
        h2: ["1.25em", "1.5em", "1.75em", "2em", "2.5em"],
        h3: ["1.1em", "1.25em", "1.5em", "1.75em", "2em"],
        p: [".8em", ".9em", "1em", "1.25em", "1.5em"],
        span: [".8em", ".85em", ".9em", "1.25em", "1.5em"]
    }

    return {
        h1: sizes.h1[index],
        h2: sizes.h2[index],
        h3: sizes.h3[index],
        p: sizes.p[index],
        span: sizes.span[index]
    }
}
