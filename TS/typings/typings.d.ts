
export {}

declare global {
    interface Question {
        question: string,
        answerType: "x" | "multi",
        answers: Array<number>,
        notAnswers?: Array<number>,
        letters?: Array<string>,
        link: string | null
    }

    interface HTMLElement {
        value: any,
        disabled: boolean
    }
    interface Element {
        style: CSSStyleDeclaration
    }
    var fbUser: firebase.default.User
}