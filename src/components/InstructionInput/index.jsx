import { useState } from 'react'

const InstructionInput = ({ onSubmit, onCancel }) => {
    const [value, setValue] = useState('')

    return (
        <div className='instruction'>
            <textarea autoFocus placeholder='Enter instruction' value={value} onChange={(e) => setValue(e.target.value)} />
            <div className='buttons'>
                <button onClick={onCancel}>Cancel</button>
                {value && <button onClick={() => onSubmit(value)}>Submit</button>}
            </div>
        </div>
    )
}

export default InstructionInput
