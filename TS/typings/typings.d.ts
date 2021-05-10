interface Question {
    question: string,
    answerType: "x" | "multi",
    answers: Array<number>,
    notAnswers?: Array<number>,
    letters?: Array<string>,
    link: string | null
}
export {}

declare global {
    interface HTMLElement {
        value: any,
        disabled: boolean
    }
    interface Element {
        style: CSSStyleDeclaration
    }
}