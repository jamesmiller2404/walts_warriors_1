'use client'

import React, { useEffect } from 'react'

const TARGET = 'Upload Media'
const CREATE_NEW = 'Create New'

function rewriteCreateButtons(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('.list-create-new-doc__create-new-button').forEach((el) => {
    if (el.textContent?.trim() === CREATE_NEW) {
      el.textContent = TARGET
    }
    if (el.getAttribute('aria-label')?.startsWith('Create new')) {
      el.setAttribute('aria-label', TARGET)
    }
  })

  root.querySelectorAll<HTMLElement>('.collection-list--media .btn').forEach((el) => {
    const text = el.textContent?.trim()
    if (text === CREATE_NEW || text === 'Create new Media' || text === 'Create new media') {
      el.textContent = TARGET
    }
  })
}

export const MediaListCreateLabel: React.FC = () => {
  useEffect(() => {
    const root = document.querySelector('.collection-list--media')
    if (!root) return

    rewriteCreateButtons(root)

    const observer = new MutationObserver(() => {
      rewriteCreateButtons(root)
    })

    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => observer.disconnect()
  }, [])

  return null
}

export default MediaListCreateLabel
