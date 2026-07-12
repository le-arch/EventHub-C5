package storage

import (
	"context"
	"mime/multipart"
)

type Storage interface {
	UploadEventImage(file multipart.File, fileHeader *multipart.FileHeader) (string, error)
	UploadFile(ctx context.Context, objectName string, data []byte, contentType string) (string, error)
}
