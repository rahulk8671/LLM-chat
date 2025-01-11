import './App.css'
import { useState, useEffect, useMemo, useRef } from 'react'
import Input from './components/Input'
import Gemini from './services/gemini'
import Markdown from 'react-markdown'
import util from './services/util'
import Modal from 'react-modal'
import InstructionInput from './components/InstructionInput'
import ContextPreview from './components/ContextPreview'

function App() {
	const [bot, setBot] = useState('')
	const [bots, setBots] = useState(localStorage.getItem("bots") ? JSON.parse(localStorage.getItem("bots")) : [])
	const [isOpen, setIsOpen] = useState(false)
	const gemini = useMemo(() => new Gemini(bot?.context || ''), [bot])
	const [currentConversation, setCurrentConversation] = useState(null)
	const [conversations, setConversations] = useState(localStorage.getItem("conversations") ? JSON.parse(localStorage.getItem("conversations")) : {})
	const [messages, setMessages] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const scrollRef = useRef()

	const onSubmit = (value) => {
		setMessages([...messages, { role: "user", parts: [{ text: value }] }])
	}

	const scrollToBottom = () => {
		if (scrollRef.current) {
			scrollRef.current.scrollTo({
				top: scrollRef.current.scrollHeight,
				behavior: 'smooth',
			});
		}
	}

	const handlNewConversation = () => {
		setMessages([])
		setCurrentConversation(null)
		// setBot('')
	}

	const handleSelectConversation = (cId) => {
		setCurrentConversation(cId)
		setMessages(conversations[cId].messages)
		setBot(conversations[cId].bot)
	}

	const handleNewBot = () => {
		setIsOpen(true)
	}

	const handleInstructionSubmit = (value) => {
		const newBot = { id: util.generateRandomId(), context: value }
		const botsList = [...bots, newBot]
		setBots(botsList)
		localStorage.setItem("bots", JSON.stringify(botsList))

		setBot(newBot)
		setIsOpen(false)
	}

	const handleBotDelete = (e, id) => {
		e.stopPropagation()
		if (bot && bot.id === id) {
			setBot(null)
		}
		const newBots = bots.filter(bot => bot.id !== id)
		setBots(newBots)
		localStorage.setItem("bots", JSON.stringify(newBots))
	}

	const handleConversationDelete = (e, cId) => {
		debugger
		e.stopPropagation()
		if (currentConversation === cId) {
			setCurrentConversation(null)
			setMessages([])
		}
		const newConversations = { ...conversations }
		delete newConversations[cId]
		setConversations(newConversations)
		localStorage.setItem("conversations", JSON.stringify(newConversations))
	}

	useEffect(() => {
		; (async () => {
			if (messages.length > 0) {
				let cId = currentConversation

				if (!cId) {
					cId = util.generateRandomId()
					setCurrentConversation(cId)
				}

				const last = messages[messages.length - 1]

				if (last.role === "user" && !isLoading) {
					const text = last.parts[0].text

					setIsLoading(true)
					const responseText = await gemini.sendMessage({ message: text, history: JSON.parse(JSON.stringify(messages)) });

					const newMessages = [...messages, { role: "model", parts: [{ text: responseText }] }]

					setMessages(newMessages)

					const conversationList = { ...conversations, [cId]: { bot, createdOn: Date.now(), ...conversations[cId] || {}, messages: newMessages } }
					setConversations(conversationList)

					localStorage.setItem("conversations", JSON.stringify(conversationList))

					setIsLoading(false)
				}

				// scroll to bottom smoothly
				setTimeout(() => {
					scrollToBottom()
				}, 500)
			}
		})()
	}, [messages, gemini, isLoading, setConversations, conversations, currentConversation, bot])

	const sortByDate = (list) => {
		const sorted = list.sort((a, b) => {
			return conversations[b].createdOn - conversations[a].createdOn
		})

		return sorted
	}

	return (
		<div className="layout">
			<div className='sidebar'>
				<button onClick={handlNewConversation}>New Conversation</button>
				{sortByDate(Object.keys(conversations)).map((key) => {
					return (
						<div onClick={() => handleSelectConversation(key)} key={key} className={`conversation ${currentConversation === key ? 'active' : ''}`}>
							<span>{conversations[key].messages[0].parts[0].text}</span>
							<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
								<span className='date'>{util.formatTimestamp(conversations[key].createdOn)}</span>
								<div>
									<span onClick={(e) => handleConversationDelete(e, key)} className='delete'>Delete</span>
								</div>
							</div>
						</div>
					)
				})}
			</div>
			<div className='main'>
				<div className='chatWindow'>
					<div ref={scrollRef} className='chatBody'>
						{messages.length === 0 ? (
							<div className='bots'>
								<button onClick={handleNewBot}>
									Create New Bot
								</button>
								<div className='botlist'>
									{bots.map((b, i) => (
										<div onClick={() => setBot(b)} key={i} className={`bot ${bot?.id === b.id ? 'active-bot' : ''}`}>
											<span>{b.context}</span>

											<div>
												<span onClick={(e) => handleBotDelete(e, b.id)} className='delete'>Delete</span>
											</div>
										</div>
									))}
								</div>

							</div>
						) : messages.map((h, i) => (
							<div key={i} className={`${h.role} chatMessage`}>
								<span>
									<Markdown>{h.parts[0].text}</Markdown>
								</span>
							</div>
						))}
					</div>
					<div className='chatFooter'>
						{/*<ContextPreview context={bot?.context} />*/}
						<Input onSubmit={onSubmit} />
					</div>
				</div>

			</div>

			<Modal
				isOpen={isOpen}
				ariaHideApp={false}
				onRequestClose={() => setIsOpen(false)}
				style={{
					content: {
						top: '50%',
						left: '50%',
						right: 'auto',
						bottom: 'auto',
						marginRight: '-50%',
						transform: 'translate(-50%, -50%)',
						border: 'none',
						background: 'none',
						padding: '0',
					},
					overlay: {
						backgroundColor: 'rgba(0, 0, 0, 0.7)',
					}
				}}
			>
				<InstructionInput onSubmit={handleInstructionSubmit} onCancel={() => setIsOpen(false)} />
			</Modal>
		</div>
	)
}

export default App
