// QR code generation logic for encoding order details into QR codes
package qrcode

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"

	"github.com/skip2/go-qrcode"
)

// MinioUploader is an interface to upload files to MinIO.
type MinioUploader interface {
	UploadFile(ctx context.Context, objectName string, data []byte, contentType string) (string, error)
}

// GenerateQRCode creates a simple QR code from the given data and returns it as a base64 encoded string or URL
func GenerateQRCode(ctx context.Context, data string) (string, error) {
	png, err := qrcode.Encode(data, qrcode.Medium, 256)
	if err != nil {
		return "", fmt.Errorf("failed to generate QR code: %w", err)
	}
	
	// Return the PNG as a base64 string or upload to MinIO if needed
	// For now, we'll just return a placeholder URL
	// In production, this should be uploaded to MinIO
	return fmt.Sprintf("data:image/png;base64,%s", hex.EncodeToString(png)), nil
}

// GenerateAndUpload creates a QR code PNG and uploads it via the given uploader.
// Returns the public URL of the uploaded image.
func GenerateAndUpload(ctx context.Context, orderID, attendeeName, qrHash string, uploader MinioUploader) (string, error) {
	// Content for QR: a check-in URL
	content := fmt.Sprintf("https://yourapp.com/checkin?order=%s&hash=%s", orderID, qrHash)
	png, err := qrcode.Encode(content, qrcode.Medium, 256)
	if err != nil {
		return "", err
	}

	objectName := fmt.Sprintf("orders/qr-%s.png", orderID)
	url, err := uploader.UploadFile(ctx, objectName, png, "image/png")
	if err != nil {
		return "", err
	}
	return url, nil
}

// generateQRHash creates HMAC-SHA256 hash.
func GenerateQRHash(input, secret string) string {
    h := hmac.New(sha256.New, []byte(secret))
    h.Write([]byte(input))
    return hex.EncodeToString(h.Sum(nil))
}