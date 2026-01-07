import { watch, type Ref, onBeforeUnmount } from 'vue'

const stack: (() => void)[] = []

// Minimalist event listener management to avoid duplicates if HMR runs
const LISTENER_KEY = '__VUE_BACK_NAV_LISTENER__'

if (typeof window !== 'undefined' && !(window as any)[LISTENER_KEY]) {
    window.addEventListener('popstate', () => {
        const handler = stack.pop()
        if (handler) {
            handler()
        }
    });
    (window as any)[LISTENER_KEY] = true
}

export function useBackNavigation(isActive: Ref<boolean>) {
    let myHandler: (() => void) | null = null

    watch(isActive, (newVal) => {
        if (newVal) {
            // Push state to history
            history.pushState({ backNav: true }, '', location.href)

            // Define handler for when back button is pressed
            myHandler = () => {
                isActive.value = false
                myHandler = null
            }
            stack.push(myHandler)
        } else {
            // If closed programmatically (myHandler is still present)
            if (myHandler) {
                const index = stack.indexOf(myHandler)
                if (index > -1) {
                    stack.splice(index, 1)
                    // Revert the pushState we did when opening
                    history.back()
                }
                myHandler = null
            }
        }
    })

    onBeforeUnmount(() => {
        // If component unmounts while dialog is open (e.g. navigation away), clean up
        if (myHandler) {
            const index = stack.indexOf(myHandler)
            if (index > -1) {
                stack.splice(index, 1)
            }
        }
    })
}
