import { useState } from 'react'

const Input = ({ onSubmit }) => {
    const [value, setValue] = useState('')

    const handleSubmit = (value) => {
        onSubmit(value)
        setValue('')
    }

    return (
        <input placeholder='Type something...' value={value} onKeyDown={(e) => e.key === 'Enter' && handleSubmit(value)} onChange={(e) => setValue(e.target.value)} type="text" />
    )
}

export default Input
