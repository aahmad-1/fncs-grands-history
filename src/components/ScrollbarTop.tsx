import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// react router doesn't reset the scrollbars position between pages by default, this forces it back to the top on every site redirect
const ScrollbarTop = () => {
    const { pathname } = useLocation()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    return null
}

export default ScrollbarTop