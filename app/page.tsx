'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { OkanaganMap } from '@/components/okanagan-map'
import { ArrowRight, Bell, Bot, ChevronDown, Heart, MapPin, MessageCircle, Mic, Plus, Search, Send, ShieldCheck, Sparkles, ThumbsUp, Users, Video, X } from 'lucide-react'

const listings = [
  { id: 1, title: '1998 JLG Telehandler', owner: 'Dave Mitchell', initials: 'DM', price: '$350', detail: 'day', category: 'Heavy Equipment', location: 'Big White Village', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=85' },
  { id: 2, title: 'Touring skis + skins', owner: 'Maya Patel', initials: 'MP', price: '$65', detail: 'weekend', category: 'Winter Sports', location: 'Kelowna North', image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=900&q=85' },
  { id: 3, title: '60ft Boom Lift', owner: 'Sarah Chen', initials: 'SC', price: '$280', detail: 'day', category: 'Aerial Lift', location: 'Vernon', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=900&q=85' },
  { id: 4, title: 'Hand-built workbench', owner: 'Elena Rossi', initials: 'ER', price: '$180', detail: 'pickup', category: 'Tools', location: 'Penticton', image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=85' },
  { id: 5, title: 'All-season utility trailer', owner: 'Jon Bell', initials: 'JB', price: '$90', detail: 'day', category: 'Heavy Equipment', location: 'Summerland', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d8?auto=format&fit=crop&w=900&q=85' },
  { id: 6, title: 'Kids ski package, 130cm', owner: 'Nora Singh', initials: 'NS', price: '$40', detail: 'season', category: 'Winter Sports', location: 'Lake Country', image: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=900&q=85' },
  { id: 7, title: 'Portable generator', owner: 'Chris Walker', initials: 'CW', price: '$55', detail: 'day', category: 'Tools', location: 'Oliver', image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=900&q=85' },
]
const bulletinPosts = [
  { author: 'Okanagan Trail Crew', initials: 'OT', time: '18 min ago', title: 'Snowline update: connector road is clear', body: 'Fresh grooming on the north loop. Share the good news with your circle.' },
  { author: 'Maya Patel', initials: 'MP', time: '1 hr ago', title: 'Looking for a pair of touring poles', body: 'Borrowing for the weekend near Kelowna. Happy to trade a lesson or lend back.' },
  { author: 'Big White Neighbours', initials: 'BN', time: '3 hrs ago', title: 'Community repair night — Thursday', body: 'Bring your gear, your questions, and something warm to share.' },
]
const people = [
  { name: 'Dave Mitchell', role: 'Work people', note: 'Added a new telehandler', initials: 'DM', color: 'forest' },
  { name: 'Sarah Chen', role: 'Friendly people', note: 'Snowshoeing this weekend', initials: 'SC', color: 'burgundy' },
  { name: 'Maya Patel', role: 'Family people', note: 'Shared a local recipe', initials: 'MP', color: 'navy' },
  { name: 'Elena Rossi', role: 'Other people', note: 'Hosting repair night', initials: 'ER', color: 'wood' },
]
const places = ['Okanagan', 'Big White', 'Kelowna', 'Vernon', 'Penticton', 'Summerland', 'Oliver', 'Osoyoos', 'Lake Country', 'Peachland']

function Avatar({ initials, size = 'md' }: { initials: string; size?: 'xs' | 'sm' | 'md' | 'lg' }) { return <div className={`avatar avatar-${size}`}>{initials}</div> }

export default function Page() {
  const router = useRouter()
  const [active, setActive] = useState<'discover' | 'people' | 'community' | 'communications'>('communications')
  const [localArea, setLocalArea] = useState('Big White')
  const [chatMode, setChatMode] = useState<'text' | 'audio' | 'video' | 'ask-ai' | 'yoddle'>('text')
  const [contactChoice, setContactChoice] = useState('Dave Mitchell')
  const [chatMessage, setChatMessage] = useState('')
  const [showAccount, setShowAccount] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [liked, setLiked] = useState<number[]>([])
  const [listingIndex, setListingIndex] = useState(0)
  const [selectedListing, setSelectedListing] = useState<typeof listings[number] | null>(null)
  const [search, setSearch] = useState('')
  const filteredListings = useMemo(() => listings.filter((item) => `${item.title} ${item.category} ${item.location}`.toLowerCase().includes(search.toLowerCase())), [search])
  const discoveryListings = filteredListings.length > 0 ? filteredListings : listings
  const currentListing = discoveryListings[listingIndex % discoveryListings.length]

  const sendChat = () => { if (chatMessage.trim()) setChatMessage('') }

  return <main className="peak-app redesign-app">
    <header className="topbar">
      <button className="brand" onClick={() => setActive('communications')} aria-label="Peak home">peak</button>
      <nav className="main-nav" aria-label="Primary navigation">
        <button className={`nav-link ${active === 'discover' ? 'active' : ''}`} onClick={() => setActive('discover')}>Discovery</button>
        <button className={`nav-link ${active === 'people' ? 'active' : ''}`} onClick={() => setActive('people')}>Good People</button>
        <button className={`nav-link ${active === 'community' ? 'active' : ''}`} onClick={() => setActive('community')}>The GREAT Community!</button>
        <button className={`nav-link ${active === 'communications' ? 'active' : ''}`} onClick={() => setActive('communications')}>Communications</button>
      </nav>
      <div className="top-actions"><button className="icon-button" aria-label="Notifications"><Bell size={18} /></button><div className="peaks-pill"><Sparkles size={14} /> 245 peaks</div><div className="account-wrap"><button className="profile-button" onClick={() => setShowAccount(!showAccount)} aria-expanded={showAccount}><Avatar initials="B" size="sm" /><ChevronDown size={14} /></button>{showAccount && <div className="account-menu"><strong>Your Peak account</strong><button onClick={() => router.push('/sign-in')}>Sign in</button><button onClick={() => router.push('/sign-up')}>Create account</button></div>}</div></div>
    </header>

    {active === 'communications' && <section className="comms-shell">
      <div className="comms-masthead"><div><div className="eyebrow"><span className="eyebrow-line" /> COMMUNITY COMMUNICATIONS <span className="eyebrow-line" /></div><h1>The Daily <em>Yoddle</em></h1><p>Useful news, warm hellos, and a private room for the people who matter.</p></div><label className="masthead-local"><MapPin size={15} /><span>Local</span><select value={localArea} onChange={(e) => setLocalArea(e.target.value)} aria-label="Choose a local community">{places.map((place) => <option key={place}>{place}</option>)}</select><ChevronDown size={14} /></label></div>
      <div className="comms-layout">
        <section className="bulletin-panel redesigned-panel"><div className="panel-heading"><div><span className="panel-kicker">{localArea.toUpperCase()} EDITION</span><h2>Bulletin Board</h2></div><span className="live-dot">● LIVE</span></div><div className="bulletin-intro"><p>Notes from around town, for people in town.</p><button className="yoddle-button" onClick={() => setChatMode('yoddle')}><Plus size={14} /> Post a Yoddle</button></div><div className="bulletin-list">{bulletinPosts.map((post) => <article className="bulletin-post" key={post.title}><div className="post-meta"><Avatar initials={post.initials} size="xs" /><span>{post.author}</span><time>{post.time}</time></div><h3>{post.title}</h3><p>{post.body}</p><button className="post-action" onClick={() => { setContactChoice(post.author); setChatMode('text') }}>Reply in the Horn <ArrowRight size={12} /></button></article>)}</div></section>
        <section className="horn-panel redesigned-horn"><div className="panel-heading"><div><span className="panel-kicker">YOUR TRUSTED CIRCLE</span><h2>The Mountain Horn</h2></div><ShieldCheck size={18} /></div><p className="horn-copy">Call, text, listen, ask for an intro — or just say hello because you miss someone.</p>{selectedListing && <div className="handoff-note" role="status"><ThumbsUp size={14} /><span><strong>{selectedListing.title}</strong><small>{selectedListing.price} · {selectedListing.location} · from Discovery</small></span><button onClick={() => setSelectedListing(null)} aria-label="Clear listing context"><X size={13} /></button></div>}<label className="contact-choice"><span className="contact-choice-label">Contact</span><select value={contactChoice} onChange={(e) => setContactChoice(e.target.value)}>{['Dave Mitchell', 'Sarah Chen', 'Maya Patel', 'Elena Rossi'].map((name) => <option key={name}>{name}</option>)}</select><ChevronDown size={14} /></label><div className="chat-mode-tabs" role="tablist">{[['text', MessageCircle, 'Text'], ['audio', Mic, 'Audio'], ['video', Video, 'Video'], ['ask-ai', Bot, 'Ask AI'], ['yoddle', Plus, 'Yoddle']].map(([mode, Icon, label]) => <button key={mode as string} className={chatMode === mode ? 'chat-mode active' : 'chat-mode'} onClick={() => setChatMode(mode as typeof chatMode)}><Icon size={14} />{label as string}</button>)}</div><div className="horn-stage">{chatMode === 'ask-ai' ? <><Bot size={28} /><strong>Ask AI about your circle</strong><span>Find the right person, draft a kind note, or plan a local ask.</span></> : chatMode === 'yoddle' ? <><Plus size={28} /><strong>Post to the Bulletin Board</strong><span>Turn a thought into a local Yoddle for {localArea}.</span></> : <><Avatar initials={contactChoice.split(' ').map((part) => part[0]).join('')} size="lg" /><strong>{chatMode === 'audio' ? 'Ready for an audio call' : chatMode === 'video' ? 'Ready for a video call' : `Message ${contactChoice}`}</strong><span>{chatMode === 'text' ? 'A quiet place to catch up.' : 'Only you and your trusted contact.'}</span></>}</div><div className="chat-compose"><input value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) sendChat() }} placeholder={chatMode === 'yoddle' ? 'What should the town know?' : 'Write a message...'} /><button onClick={sendChat} aria-label="Send message"><Send size={15} /></button></div></section>
      </div>
    </section>}

    {active === 'discover' && <section className="discover-shell"><div className="discover-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> DISCOVERY <span className="eyebrow-line" /></div><h1>Good <em>Gear.</em></h1><p>Explore trusted listings from your Okanagan community.</p></div><div className="search-box"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search local listings" /></div></div><div className="discover-layout"><div className="tinder-column"><div className="listing-card"><img src={currentListing.image} alt={currentListing.title} /><div className="listing-overlay"><span>{currentListing.category}</span><h2>{currentListing.title}</h2><p>{currentListing.location} · {currentListing.owner}</p><strong>{currentListing.price} <small>/ {currentListing.detail}</small></strong></div></div><div className="listing-actions"><button onClick={() => setListingIndex((index) => (index + 1) % listings.length)} aria-label="Skip listing"><X size={22} /></button><button className="like-listing" onClick={() => { setLiked((items) => items.includes(currentListing.id) ? items : [...items, currentListing.id]); setSelectedListing(currentListing); setContactChoice(currentListing.owner); setChatMode('text'); setActive('communications') }} aria-label={`Like ${currentListing.title} and open Communications`}><ThumbsUp size={22} /></button></div><p className="swipe-hint">Like a listing to bring it into Communications.</p></div><div className="map-panel"><div className="map-top"><div><span className="map-label">YOUR MAP · OKANAGAN</span><h2>Connected via 7 people in your circle</h2></div><button className="text-button" onClick={() => { setContactChoice(currentListing.owner); setSelectedListing(currentListing); setChatMode('text'); setActive('communications') }}>Ask for an Intro... <ArrowRight size={14} /></button></div><div className="map-live-wrap"><OkanaganMap /><div className="map-trust-card"><ShieldCheck size={15} /><span>Only your trusted<br /><strong>network is visible</strong></span></div></div><div className="map-footer"><div><strong>{liked.length || 7} local listings</strong><small>good gear, nearby</small></div><button className="text-button" onClick={() => setActive('communications')}>Open Communications <ArrowRight size={14} /></button></div></div></div><div className="listing-strip">{filteredListings.map((item) => <button key={item.id} onClick={() => { setListingIndex(listings.findIndex((listing) => listing.id === item.id)); setActive('discover') }}><img src={item.image} alt="" /><span>{item.title}<strong>{item.price}</strong></span></button>)}</div></section>}

    {active === 'people' && <section className="people-shell"><div className="section-kicker">GOOD PEOPLE</div><h1>The people <em>behind</em> the circle.</h1><p className="section-lede">A contact system for the people you work with, laugh with, love, and rely on.</p><div className="people-grid">{['Work People', 'Friendly People', 'Family People', 'Other People'].map((group, index) => <article className={`people-panel ${people[index].color}`} key={group}><div className="people-panel-head"><span>{group}</span><Users size={16} /></div><Avatar initials={people[index].initials} size="lg" /><h2>{people[index].name}</h2><p>{people[index].note}</p><button onClick={() => { setContactChoice(people[index].name); setActive('communications') }}>Open contact <ArrowRight size={13} /></button></article>)}</div><div className="flow-card"><div><span className="flow-word">peak <em>→</em> flow</span><p>Deals, invoices, tax notes, receipts, and the local services behind every exchange.</p></div><button onClick={() => setActive('communications')}>Open dealflow <ArrowRight size={15} /></button></div></section>}

    {active === 'community' && <section className="community-shell"><div className="community-title"><div><div className="section-kicker">THE GREAT COMMUNITY OF {localArea.toUpperCase()}</div><h1>Lexicon</h1><p>A living wall of identities, updates, sound, games, and small worlds made by your community.</p></div><button className="invite-button" onClick={() => setShowInvite(true)}><Plus size={16} /> Add a tile</button></div><div className="lexicon-grid">{people.concat([{ name: 'Big White Repair Night', role: 'Community widget', note: 'Thursday at 6 PM', initials: 'BW', color: 'wood' }]).map((person, index) => <article className={`lexicon-tile ${person.color}`} key={person.name} style={{ '--tile-span': index === 0 ? 2 : 1 } as React.CSSProperties}><div className="tile-top"><Avatar initials={person.initials} size="md" /><span>0{index + 1}</span></div><h2>{person.name}</h2><p>{person.note}</p><button onClick={() => setActive('communications')}>View widget <ArrowRight size={13} /></button></article>)}</div></section>}

    {showInvite && <div className="modal-backdrop" onClick={() => setShowInvite(false)}><div className="invite-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setShowInvite(false)}><X size={18} /></button><div className="invite-icon"><Users size={22} /></div><h2>Bring someone good.</h2><p>Peak is better when your circle is bigger. Invite a trusted friend to join the community.</p><input placeholder="friend@email.com" /><button className="primary-button" onClick={() => setShowInvite(false)}>Send invitation <ArrowRight size={15} /></button></div></div>}
  </main>
}
