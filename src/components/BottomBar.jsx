import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import SearchBox from './SearchBox'
import FilterPanel from './FilterPanel'
import './BottomBar.css'

function BottomBar({
    minerals = [],
    selectedMineral = null,
    onSelectMineral = () => {},
}) {
    const [open, setOpen] = useState(false) // is the mineral filter list open?

    // Responsive blurb. The bar has a fixed height so it never grows up into the
    // map; as the window narrows we step the blurb down instead of letting the
    // bar grow. 2 = both paragraphs, 1 = second only, 0 = none.
    const [blurbLevel, setBlurbLevel] = useState(2)
    const [resizeTick, setResizeTick] = useState(0)
    const innerRef = useRef(null)
    const descBoxRef = useRef(null)

    useEffect(() => {
        const onResize = () => {
            setBlurbLevel(2)
            setResizeTick(t => t + 1)
        }
        window.addEventListener('resize', onResize)
        let ro
        if (innerRef.current && 'ResizeObserver' in window) {
            ro = new ResizeObserver(onResize)
            ro.observe(innerRef.current)
        }
        return () => {
            window.removeEventListener('resize', onResize)
            if (ro) ro.disconnect()
        }
    }, [])

    useLayoutEffect(() => {
        const inner = innerRef.current
        const box = descBoxRef.current
        if (!inner || !box) return
        const cs = getComputedStyle(inner)
        const avail = inner.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)
        const TOLERANCE = 4
        if (box.getBoundingClientRect().height > avail + TOLERANCE && blurbLevel > 0) {
            setBlurbLevel(l => l - 1)
        }
    }, [blurbLevel, resizeTick])

    const toggleFilter = () => {
        setOpen(prev => {
            const next = !prev
            onSelectMineral(null)
            return next
        })
    }

    return (
        <div className="bottombar">
            {open && (
                <FilterPanel
                    minerals={minerals}
                    selectedMineral={selectedMineral}
                    onSelect={onSelectMineral}
                    onClose={toggleFilter}
                />
            )}

            <div className="bottombar-inner" ref={innerRef}>
                <div className="bottombar-title">
                    WHAT ARE THE<br />
                    <span className="bottombar-title-highlight">CRITICAL MINERALS</span><br />
                    BEHIND AI?
                </div>

                {blurbLevel >= 1 && (
                    <div className="bottombar-description-box" ref={descBoxRef}>
                        <div className="bottombar-description">
                            {blurbLevel >= 2 && (
                                <p>
                                    Every AI chip rests on a supply chain of raw
                                    material. Metals like tantalum and copper are
                                    dug out of the ground, refined into usable form,
                                    and sold into the hardware that trains and runs
                                    these models--a chain that concentrates in a
                                    handful of countries.
                                </p>
                            )}
                            <p>
                                Mapped here are the countries that mine these
                                minerals, the countries that refine them, and the
                                sales that carry them onward. Hover or search a
                                mineral to trace where it comes from.
                            </p>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: 'auto' }}>
                    <SearchBox
                        open={open}
                        onToggle={toggleFilter}
                        mineralCount={minerals.length}
                    />
                </div>
            </div>
        </div>
    )
}

export default BottomBar
