import { Popover } from 'react-tiny-popover'
import { useState } from 'react'

const ContextPreview = ({ context }) => {
    const [isHovered, setIsHovered] = useState(false)

    if (context) {
        return (
            <Popover
                isOpen={isHovered}
                positions={['top']} // preferred positions by priority
                content={
                    <div className='context-preview-popup'>{context}</div>
                }
            >
                <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className='context-preview'></div>
            </Popover>
        )
    }

    return null
}

export default ContextPreview
