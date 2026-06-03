import React from 'react';

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Something went wrong. Please try again.',
  onRetry,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        minHeight: '200px',
        textAlign: 'center',
        color: '#333',
      }}
    >
      <div
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#ffe5e5',
          color: '#d32f2f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          marginBottom: '16px',
        }}
      >
        !
      </div>
      <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Error</h2>
      <p style={{ maxWidth: '360px', margin: '12px 0 0', lineHeight: 1.5 }}>{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          style={{
            marginTop: '18px',
            padding: '10px 18px',
            borderRadius: '6px',
            border: '1px solid #d32f2f',
            backgroundColor: '#fff',
            color: '#d32f2f',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      ) : null}
    </div>
  );
};

export default ErrorState;
