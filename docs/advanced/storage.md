---
title: File Storage
description: File storage and management in Stacks.js
---

# File Storage

Stacks.js provides a unified file storage API with support for local, cloud, and custom storage drivers.

## Configuration

### Storage Configuration

```typescript
// config/storage.ts
export default {
  // Default disk
  default: 'local',

  disks: {
    // Local filesystem
    local: {
      driver: 'local',
      root: 'storage/app',
      url: '/storage',
      visibility: 'private',
    },

    // Public files
    public: {
      driver: 'local',
      root: 'storage/app/public',
      url: '/storage',
      visibility: 'public',
    },

    // Amazon S3
    s3: {
      driver: 's3',
      bucket: process.env.AWS_BUCKET,
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      url: process.env.AWS_URL,
      endpoint: process.env.AWS_ENDPOINT, // For S3-compatible services
    },

    // Google Cloud Storage
    gcs: {
      driver: 'gcs',
      bucket: process.env.GCS_BUCKET,
      projectId: process.env.GCS_PROJECT_ID,
      keyFile: process.env.GCS_KEY_FILE,
    },

    // Cloudflare R2
    r2: {
      driver: 's3',
      bucket: process.env.R2_BUCKET,
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  }
}
```

## Basic Operations

### Writing Files

```typescript
import { Storage } from '@stacksjs/storage'

// Write string content
await Storage.put('documents/report.txt', 'File content here')

// Write with visibility
await Storage.put('images/photo.jpg', buffer, {
  visibility: 'public',
})

// Write to specific disk
await Storage.disk('s3').put('backups/data.json', jsonContent)

// Prepend/Append to file
await Storage.prepend('logs/app.log', 'New log entry\n')
await Storage.append('logs/app.log', 'Another entry\n')
```

### Reading Files

```typescript
// Read file contents
const content = await Storage.get('documents/report.txt')

// Check if file exists
if (await Storage.exists('documents/report.txt')) {
  // File exists
}

// Get file size
const size = await Storage.size('documents/report.txt')

// Get last modified time
const lastModified = await Storage.lastModified('documents/report.txt')

// Get file URL
const url = await Storage.url('images/photo.jpg')

// Get temporary URL (for private files)
const tempUrl = await Storage.temporaryUrl('documents/secret.pdf', {
  expiresIn: 3600, // 1 hour
})
```

### Deleting Files

```typescript
// Delete single file
await Storage.delete('documents/old-report.txt')

// Delete multiple files
await Storage.delete([
  'documents/file1.txt',
  'documents/file2.txt',
  'documents/file3.txt',
])

// Delete if exists
if (await Storage.exists(path)) {
  await Storage.delete(path)
}
```

### Copying and Moving

```typescript
// Copy file
await Storage.copy('source/file.txt', 'destination/file.txt')

// Move file
await Storage.move('old-location/file.txt', 'new-location/file.txt')

// Copy between disks
await Storage.disk('local')
  .copy('file.txt', Storage.disk('s3'), 'backups/file.txt')
```

## Directories

### Directory Operations

```typescript
// List files in directory
const files = await Storage.files('documents')

// List all files recursively
const allFiles = await Storage.allFiles('documents')

// List directories
const directories = await Storage.directories('uploads')

// List all directories recursively
const allDirectories = await Storage.allDirectories('uploads')

// Create directory
await Storage.makeDirectory('new-folder')

// Delete directory
await Storage.deleteDirectory('old-folder')
```

### Glob Patterns

```typescript
// Find files matching pattern
const images = await Storage.glob('uploads/**/*.{jpg,png,gif}')

const recentLogs = await Storage.glob('logs/2024-*.log')
```

## File Uploads

### Handling Uploads

```typescript
// routes/api.ts
router.post('/upload', async (request) => {
  const file = request.file('avatar')

  // Validate file
  await request.validate({
    avatar: 'required|file|mimes:jpg,png|max:2048', // 2MB max
  })

  // Store file
  const path = await file.store('avatars')

  return { path, url: Storage.url(path) }
})
```

### Upload Options

```typescript
// Store with custom filename
const path = await file.storeAs('avatars', 'user-123-avatar.jpg')

// Store to specific disk
const path = await file.store('avatars', { disk: 's3' })

// Store with visibility
const path = await file.store('avatars', { visibility: 'public' })

// Get file info before storing
console.log(file.name)          // Original filename
console.log(file.extension)     // File extension
console.log(file.size)          // Size in bytes
console.log(file.mimeType)      // MIME type
```

### Multiple File Uploads

```typescript
router.post('/gallery', async (request) => {
  const files = request.files('images')

  const paths = await Promise.all(
    files.map(file => file.store('gallery'))
  )

  return { paths }
})
```

### Chunked Uploads

```typescript
// For large files, use chunked uploads
router.post('/upload/chunk', async (request) => {
  const {
    chunkIndex,
    totalChunks,
    uploadId,
  } = request.body

  const chunk = request.file('chunk')

  // Store chunk
  await chunk.storeAs('temp/chunks', `${uploadId}-${chunkIndex}`)

  // If last chunk, combine
  if (chunkIndex === totalChunks - 1) {
    const finalPath = await combineChunks(uploadId, totalChunks)
    return { path: finalPath, complete: true }
  }

  return { complete: false }
})

async function combineChunks(uploadId: string, totalChunks: number) {
  const chunks = []

  for (let i = 0; i < totalChunks; i++) {
    const chunk = await Storage.get(`temp/chunks/${uploadId}-${i}`)
    chunks.push(chunk)
  }

  const combined = Buffer.concat(chunks)
  const finalPath = `uploads/${uploadId}`

  await Storage.put(finalPath, combined)

  // Clean up chunks
  for (let i = 0; i < totalChunks; i++) {
    await Storage.delete(`temp/chunks/${uploadId}-${i}`)
  }

  return finalPath
}
```

## Image Processing

### Image Manipulation

```typescript
import { Image } from '@stacksjs/image'

router.post('/upload/avatar', async (request) => {
  const file = request.file('avatar')

  // Process image
  const processed = await Image.make(file)
    .resize(200, 200)
    .crop('center')
    .quality(80)
    .format('webp')
    .toBuffer()

  // Store processed image
  const path = await Storage.put('avatars/user-123.webp', processed, {
    visibility: 'public',
  })

  return { path }
})
```

### Image Variants

```typescript
// Generate multiple sizes
const variants = {
  thumbnail: { width: 150, height: 150 },
  medium: { width: 500, height: 500 },
  large: { width: 1200, height: 1200 },
}

const paths = {}

for (const [name, size] of Object.entries(variants)) {
  const processed = await Image.make(file)
    .resize(size.width, size.height, { fit: 'inside' })
    .toBuffer()

  paths[name] = await Storage.put(
    `images/${id}/${name}.webp`,
    processed
  )
}

return { paths }
```

### Lazy Image Processing

```typescript
// Process on-demand via URL
router.get('/images/:path(*)', async (request) => {
  const { path } = request.params
  const { w, h, q, f } = request.query // width, height, quality, format

  // Check cache first
  const cacheKey = `processed/${path}?w=${w}&h=${h}&q=${q}&f=${f}`

  if (await Storage.exists(cacheKey)) {
    return Storage.response(cacheKey)
  }

  // Process image
  const original = await Storage.get(`originals/${path}`)
  const processed = await Image.make(original)
    .resize(Number(w) || null, Number(h) || null)
    .quality(Number(q) || 80)
    .format(f || 'webp')
    .toBuffer()

  // Cache result
  await Storage.put(cacheKey, processed)

  return new Response(processed, {
    headers: {
      'Content-Type': `image/${f || 'webp'}`,
      'Cache-Control': 'public, max-age=31536000',
    },
  })
})
```

## Streaming

### Stream Large Files

```typescript
// Read as stream
const stream = await Storage.readStream('large-file.zip')

// Write from stream
await Storage.writeStream('backup.zip', inputStream)

// Pipe to response
router.get('/download/:file', async (request) => {
  const { file } = request.params
  const stream = await Storage.readStream(file)

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${file}"`,
    },
  })
})
```

### Stream Processing

```typescript
import { Transform } from 'stream'

// Process file while streaming
const readStream = await Storage.readStream('input.csv')

const transform = new Transform({
  transform(chunk, encoding, callback) {
    // Process chunk
    const processed = processChunk(chunk)
    callback(null, processed)
  }
})

const writeStream = await Storage.writeStream('output.csv')

readStream.pipe(transform).pipe(writeStream)
```

## File Visibility

### Managing Visibility

```typescript
// Set visibility on upload
await Storage.put('file.txt', content, {
  visibility: 'public', // or 'private'
})

// Change visibility later
await Storage.setVisibility('file.txt', 'public')

// Get current visibility
const visibility = await Storage.getVisibility('file.txt')
```

### Visibility Configuration

```typescript
// config/storage.ts
export default {
  disks: {
    s3: {
      driver: 's3',
      // ... other config

      // Custom visibility mappings
      visibility: {
        public: {
          ACL: 'public-read',
        },
        private: {
          ACL: 'private',
        },
      },
    },
  },
}
```

## Signed URLs

### Temporary URLs for Private Files

```typescript
// Generate signed URL
const url = await Storage.disk('s3').temporaryUrl('private/document.pdf', {
  expiresIn: 3600, // seconds
})

// With custom response headers
const url = await Storage.disk('s3').temporaryUrl('private/document.pdf', {
  expiresIn: 3600,
  responseContentDisposition: 'attachment; filename="download.pdf"',
  responseContentType: 'application/pdf',
})
```

### Signed Upload URLs

```typescript
// Generate pre-signed upload URL
router.get('/upload-url', async (request) => {
  const { filename, contentType } = request.query

  const { url, fields } = await Storage.disk('s3').signedUploadUrl({
    key: `uploads/${crypto.randomUUID()}/${filename}`,
    contentType,
    expiresIn: 3600,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  return { url, fields }
})

// Client-side direct upload
// const formData = new FormData()
// Object.entries(fields).forEach(([key, value]) => {
//   formData.append(key, value)
// })
// formData.append('file', file)
// await fetch(url, { method: 'POST', body: formData })
```

## File Metadata

### Working with Metadata

```typescript
// Get file metadata
const metadata = await Storage.metadata('document.pdf')
// { size, lastModified, contentType, ... }

// Set custom metadata (S3)
await Storage.put('file.txt', content, {
  metadata: {
    'x-custom-key': 'custom-value',
    'uploaded-by': 'user-123',
  },
})

// Read custom metadata
const { metadata } = await Storage.disk('s3').metadata('file.txt')
```

### MIME Type Detection

```typescript
import { getMimeType } from '@stacksjs/storage'

// From filename
const mimeType = getMimeType('document.pdf') // 'application/pdf'

// From file content
const mimeType = await getMimeType(buffer)
```

## Custom Drivers

### Creating a Custom Driver

```typescript
// app/Storage/CustomDriver.ts
import type { StorageDriver, StorageConfig } from '@stacksjs/storage'

export class CustomDriver implements StorageDriver {
  constructor(private config: StorageConfig) {}

  async put(path: string, content: Buffer): Promise<void> {
    // Implementation
  }

  async get(path: string): Promise<Buffer> {
    // Implementation
  }

  async delete(path: string): Promise<void> {
    // Implementation
  }

  async exists(path: string): Promise<boolean> {
    // Implementation
  }

  async url(path: string): Promise<string> {
    // Implementation
  }

  // ... other methods
}

// Register driver
Storage.extend('custom', (config) => new CustomDriver(config))
```

### Using Custom Driver

```typescript
// config/storage.ts
export default {
  disks: {
    custom: {
      driver: 'custom',
      // Custom config options
    },
  },
}
```

## Storage Events

### Listening to Storage Events

```typescript
import { Storage } from '@stacksjs/storage'

Storage.on('write', (path, disk) => {
  console.log(`File written: ${path} on ${disk}`)
})

Storage.on('delete', (path, disk) => {
  console.log(`File deleted: ${path} on ${disk}`)
})

Storage.on('copy', (source, destination) => {
  console.log(`File copied: ${source} to ${destination}`)
})
```

### Cleanup Jobs

```typescript
// app/Jobs/CleanupTempFiles.ts
export default {
  schedule: '0 2 * * *', // Daily at 2 AM

  async handle() {
    const tempFiles = await Storage.allFiles('temp')
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000

    for (const file of tempFiles) {
      const lastModified = await Storage.lastModified(file)

      if (lastModified < oneDayAgo) {
        await Storage.delete(file)
      }
    }
  }
}
```

## Best Practices

### File Organization

```
storage/
├── app/
│   ├── avatars/           # User avatars
│   │   └── {user-id}/
│   ├── documents/         # User documents
│   │   └── {user-id}/
│   ├── public/            # Publicly accessible
│   │   ├── images/
│   │   └── assets/
│   └── temp/              # Temporary files
├── framework/             # Framework files
│   ├── cache/
│   └── sessions/
└── logs/                  # Application logs
```

### Security Considerations

```typescript
// Validate file types
await request.validate({
  file: 'required|file|mimes:jpg,png,pdf|max:10240',
})

// Use random filenames
const filename = `${crypto.randomUUID()}${extname(file.name)}`

// Don't expose internal paths
const publicUrl = Storage.url(path) // Use this, not the raw path

// Set proper visibility
await Storage.put('private/document.pdf', content, {
  visibility: 'private',
})
```

### Performance Tips

```typescript
// Use streaming for large files
const stream = await Storage.readStream('large-file.zip')

// Batch operations
await Promise.all(files.map(f => Storage.delete(f)))

// Use CDN for public assets
// Configure in storage config with `url` pointing to CDN

// Clean up temp files regularly
// Use scheduled jobs for cleanup
```
