import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { fetcher } from '../fetcher'

// State that reflects if the current user has already selected a reaction for a specific blog post
const intialReactionState = {
  liked: false,
  loved: false,
  clapped: false,
  partied: false,
  has_read: false, // if reader is on the page, set their read status to true
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
    setReactions(true)
  }, [data])

  async function handleIncrementLike() {
    updateReactions('liked')

    await fetch(`/api/reactions/${slug}`, {
      method: 'POST',
      body: JSON.stringify({
        reaction: 'liked',
        type: 'increment',
      }),
    })

    mutate({ ...data, liked: data.liked_count + 1 })
  }

  async function handleDecrementLike() {
    updateReactions('liked')

    await fetch(`/api/reactions/${slug}`, {
      method: 'POST',
      body: JSON.stringify({
        reaction: 'liked',
        type: 'decrement',
      }),
    })

    mutate({ ...data, liked: data.liked_count - 1 })
  }

  async function handleIncrementLove() {
    updateReactions('loved')

    await fetch(`/api/reactions/${slug}`, {
      method: 'POST',
      body: JSON.stringify({
        reaction: 'loved',
        type: 'increment',
      }),
    })

    mutate({ ...data, loved: data.loved_count + 1 })
  }

  async function handleDecrementLove() {
    updateReactions('loved')

    await fetch(`/api/reactions/${slug}`, {
      method: 'POST',
      body: JSON.stringify({
        reaction: 'loved',
        type: 'decrement',
      }),
    })

    mutate({ ...data, loved: data.loved_count - 1 })
  }

  // ===== HELPER FUNCTIONS =====
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

  return [
    hasLiked,
    hasLoved,
    reactions,
    handleIncrementLike,
    handleDecrementLike,
    handleIncrementLove,
    handleDecrementLove,
  ]
}
