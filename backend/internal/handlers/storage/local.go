package storage

import (
	"context"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"os"
	"path/filepath"

	"github.com/google/uuid"
)

type LocalStorage struct {
	UploadDir string
}

func NewLocalStorage(uploadDir string) *LocalStorage {
	dir := filepath.Clean(uploadDir)
	if err := os.MkdirAll(dir, 0755); err != nil {
		log.Fatalf("Failed to create upload directory %s: %v", dir, err)
	}
	log.Printf("Local storage initialized at %s", dir)
	return &LocalStorage{UploadDir: dir}
}

func (s *LocalStorage) UploadEventImage(file multipart.File, fileHeader *multipart.FileHeader) (string, error) {
	ext := filepath.Ext(fileHeader.Filename)
	objectName := fmt.Sprintf("events/%s%s", uuid.New().String(), ext)
	fullPath := filepath.Join(s.UploadDir, objectName)

	if err := os.MkdirAll(filepath.Dir(fullPath), 0755); err != nil {
		return "", fmt.Errorf("failed to create subdirectory: %w", err)
	}

	dst, err := os.Create(fullPath)
	if err != nil {
		return "", fmt.Errorf("failed to create file %s: %w", fullPath, err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return "", fmt.Errorf("failed to write file %s: %w", fullPath, err)
	}

	url := fmt.Sprintf("/uploads/%s", objectName)
	log.Printf("LocalStorage: saved event image to %s, url=%s", fullPath, url)
	return url, nil
}

func (s *LocalStorage) UploadFile(ctx context.Context, objectName string, data []byte, contentType string) (string, error) {
	fullPath := filepath.Join(s.UploadDir, objectName)

	if err := os.MkdirAll(filepath.Dir(fullPath), 0755); err != nil {
		return "", fmt.Errorf("failed to create subdirectory: %w", err)
	}

	if err := os.WriteFile(fullPath, data, 0644); err != nil {
		return "", fmt.Errorf("failed to write file %s: %w", fullPath, err)
	}

	url := fmt.Sprintf("/uploads/%s", objectName)
	log.Printf("LocalStorage: saved file to %s, url=%s", fullPath, url)
	return url, nil
}
