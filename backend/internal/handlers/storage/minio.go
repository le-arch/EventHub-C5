package storage

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"mime/multipart"
	"path/filepath"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type MinioClient struct {
    Client     *minio.Client
    BucketName string
    Endpoint   string
    UseSSL     bool
}

func NewMinioClient(endpoint, accessKey, secretKey, bucketName string, useSSL bool) (*MinioClient, error) {
    client, err := minio.New(endpoint, &minio.Options{
        Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
        Secure: useSSL,
    })
    if err != nil {
        return nil, err
    }

    // Create bucket if it doesn't exist
    exists, err := client.BucketExists(context.Background(), bucketName)
    if err != nil {
        return nil, err
    }
	if !exists {
		err = client.MakeBucket(context.Background(), bucketName, minio.MakeBucketOptions{})
		if err != nil {
			return nil, err
		}
		log.Printf("Bucket '%s' created successfully", bucketName)
	}

	// Set public-read bucket policy so event cover images are accessible without authentication.
	policyJSON := fmt.Sprintf(`{
		"Version": "2012-10-17",
		"Statement": [{
			"Effect": "Allow",
			"Principal": {"AWS": ["*"]},
			"Action": ["s3:GetObject"],
			"Resource": ["arn:aws:s3:::%s/*"]
		}]
	}`, bucketName)
	if err := client.SetBucketPolicy(context.Background(), bucketName, policyJSON); err != nil {
		return nil, fmt.Errorf("failed to set public-read policy on bucket %s: %w", bucketName, err)
	}
	log.Printf("Bucket '%s' policy set to public-read", bucketName)

	return &MinioClient{
        Client:     client,
        BucketName: bucketName,
        Endpoint:   endpoint,
        UseSSL:     useSSL,
    }, nil
}

// UploadEventImage uploads an image file and returns the public URL.
func (m *MinioClient) UploadEventImage(file multipart.File, fileHeader *multipart.FileHeader) (string, error) {
    // Generate unique filename
    ext := filepath.Ext(fileHeader.Filename)
    objectName := fmt.Sprintf("events/%s%s", uuid.New().String(), ext)

    // Upload to bucket
    info, err := m.Client.PutObject(context.Background(), m.BucketName, objectName, file, fileHeader.Size, minio.PutObjectOptions{
        ContentType: fileHeader.Header.Get("Content-Type"),
    })
    if err != nil {
        return "", err
    }

    // Build public URL (adjust for your setup)
    // If you have a reverse proxy or direct port, use appropriate base URL.
    // For local development, you might use http://localhost:9000/bucket/...
    // For production, use your domain (e.g., https://images.yourdomain.com)
    var publicURL string
    if m.UseSSL {
        publicURL = fmt.Sprintf("https://%s/%s/%s", m.Endpoint, m.BucketName, objectName)
    } else {
        // Assuming MinIO is exposed on port 9000 directly.
        // If using nginx proxy, adjust accordingly.
        publicURL = fmt.Sprintf("http://localhost:9000/%s/%s", m.BucketName, objectName)
    }
    _ = info // can be used for logging
    return publicURL, nil
}

func (m *MinioClient) UploadFile(ctx context.Context, objectName string, data []byte, contentType string) (string, error) {
	reader := bytes.NewReader(data)
	_, err := m.Client.PutObject(ctx, m.BucketName, objectName, reader, int64(len(data)), minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return "", err
	}
	// Return public URL (assuming bucket is public)
	return fmt.Sprintf("https://%s/%s/%s", m.Endpoint, m.BucketName, objectName), nil
}