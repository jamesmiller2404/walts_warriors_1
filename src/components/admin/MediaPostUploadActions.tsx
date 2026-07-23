'use client'

import React from 'react'
import { Button, useConfig, useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'

const baseClass = 'media-post-upload-actions'

export const MediaPostUploadActions: React.FC = () => {
  const { id } = useDocumentInfo()
  const { config } = useConfig()
  const filename = useFormFields(([fields]) => fields.filename?.value)

  if (!id || !filename) {
    return null
  }

  const adminRoute = config.routes.admin
  const createURL = formatAdminURL({
    adminRoute,
    path: '/collections/media/create',
  })
  const listURL = formatAdminURL({
    adminRoute,
    path: '/collections/media',
  })

  return (
    <div
      className={baseClass}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginTop: '1rem',
        marginBottom: '0.5rem',
      }}
    >
      <Button buttonStyle="primary" el="link" size="medium" to={createURL}>
        Upload another image
      </Button>
      <Button buttonStyle="secondary" el="link" size="medium" to={listURL}>
        Back to Media
      </Button>
    </div>
  )
}

export default MediaPostUploadActions
