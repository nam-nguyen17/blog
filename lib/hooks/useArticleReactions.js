import { useEffect, useState } from 'react'

import { fetcher } from '../fetcher'
import useSWR from 'swr'

// State that reflects if the current user has already selected a reaction for a specific blog post
const initialReactionState = {
  liked: false,
  loved: false,
  clapped: false,
  partied: false,
  has_read: true, // if reader is on the page, set their read status to true
}

export default function useArticleReactions(slug) {
  // Flags to indicate if the current user has performed any reactions
  const [hasLiked, setHasLiked] = useState(false)
  const [hasLoved, setHasLoved] = useState(false)
  const [hasClapped, setHasClapped] = useState(false)
  const [hasPartied, setHasPartied] = useState(false)
  const [reactions, setReactions] = useState({ liked: true })

  const [hydrated, setHydrated] = useState(false)

  // Reaction count data
  const { data, mutate } = useSWR(`/api/reactions/${slug}`, fetcher, {
    refreshInterval: 25000,
  })

  useEffect(() => {
    setHydrated(true)
  }, [])

  // Once the page is hydrated, we have access to localStorage.
  // Also call this effect when localStorage is changed to properly update reaction flags
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { liked, loved, clapped, partied } = getReactionsFromLocalStorage()

      // Set values after grabbing data from localStorage
      setHasLiked(liked)
      setHasLoved(loved)
      setHasClapped(clapped)
      setHasPartied(partied)
    }
  }, [hydrated, setReactionsToLocalStorage])

  useEffect(() => {
    setReactions(data)
  }, [data])

  async function handleIncrementLike() {
    updateReactions('liked')

    await fetch(`/api/reactions/${slug}`, {
      method: 'POST',
      body: JSON.stringify({
        reaction: 'like_count',
        type: 'increment',
      }),
    })

    mutate({ ...data, liked: data.like_count + 1 })
  }

  async function handleDecrementLike() {
    updateReactions('liked')

    await fetch(`/api/reactions/${slug}`, {
      method: 'POST',
      body: JSON.stringify({
        reaction: 'like_count',
        type: 'decrement',
      }),
    })

    mutate({ ...data, liked: data.like_count - 1 })
  }

  async function handleIncrementLove() {
    updateReactions('loved')

    await fetch(`/api/reactions/${slug}`, {
      method: 'POST',
      body: JSON.stringify({
        reaction: 'love_count',
        type: 'increment',
      }),
    })

    mutate({ ...data, loved: data.love_count + 1 })
  }

  async function handleDecrementLove() {
    updateReactions('loved')

    await fetch(`/api/reactions/${slug}`, {
      method: 'POST',
      body: JSON.stringify({
        reaction: 'love_count',
        type: 'decrement',
      }),
    })

    mutate({ ...data, loved: data.love_count - 1 })
  }

  async function handleIncrementClap() {
    updateReactions('clapped')

    await fetch(`/api/reactions/${slug}`, {
      method: 'POST',
      body: JSON.stringify({
        reaction: 'clap_count',
        type: 'increment',
      }),
    })
  }

  async function handleDecrementClap() {
    updateReactions('clapped')

    await fetch(`/api/reactions/${slug}`, {
      method: 'POST',
      body: JSON.stringify({
        reaction: 'clap_count',
        type: 'decrement',
      }),
    })
  }

  async function handleIncrementParty() {
    updateReactions('partied')

    await fetch(`/api/reactions/${slug}`, {
      method: 'POST',
      body: JSON.stringify({
        reaction: 'partied_count',
        type: 'increment',
      }),
    })
  }

  async function handleDecrementParty() {
    updateReactions('partied')

    await fetch(`/api/reactions/${slug}`, {
      method: 'POST',
      body: JSON.stringify({
        reaction: 'partied_count',
        type: 'decrement',
      }),
    })
  }

  // === HELPER FUNCTIONS ===

  function updateReactions(reaction) {
    const currentReactions = getReactionsFromLocalStorage()
    let updatedReactionState = { ...currentReactions }
    const prevValue = updatedReactionState[reaction]
    updatedReactionState[reaction] = !prevValue
    setReactionsToLocalStorage(updatedReactionState)
  }

  function getReactionsFromLocalStorage() {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem(slug)) || initialReactionState
    }
    return null
  }

  function setReactionsToLocalStorage(reactions) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(slug, JSON.stringify(reactions))
    }
  }

  return {
    hasLiked,
    hasLoved,
    hasClapped,
    hasPartied,
    reactions,
    handleIncrementLike,
    handleDecrementLike,
    handleIncrementLove,
    handleDecrementLove,
    handleIncrementClap,
    handleDecrementClap,
    handleIncrementParty,
    handleDecrementParty,
  }
}
