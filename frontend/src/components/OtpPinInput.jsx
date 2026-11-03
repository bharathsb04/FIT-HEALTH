import React, { useRef, useEffect } from 'react';

/**
 * OtpPinInput - High-End 6-Digit Segmented Verification Code Input
 * Replaces generic single text fields with discrete numeric digit boxes.
 * Features:
 * - 6 isolated square digit cells with visual separator
 * - Auto-advance on keystroke
 * - Auto-retreat on Backspace
 * - Full paste handling (splits 6 digits across cells)
 * - Mobile numeric keyboard support (inputMode="numeric")
 * - Role-based accent colors (Emerald green for member, Gold/amber for admin)
 */
export const OtpPinInput = ({
  value = '',
  onChange,
  length = 6,
  role = 'member',
  autoFocus = true,
  disabled = false,
  error = false
}) => {
  const inputsRef = useRef([]);

  const digits = Array.from({ length }, (_, i) => value[i] || '');
  const isRoleAdmin = role === 'admin';
  const activeColor = isRoleAdmin ? 'var(--amber, #f59e0b)' : 'var(--primary, #10b981)';
  const activeGlow = isRoleAdmin ? 'rgba(245, 158, 11, 0.35)' : 'rgba(16, 185, 129, 0.35)';

  useEffect(() => {
    if (autoFocus && inputsRef.current[0] && !disabled) {
      inputsRef.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const handleInputChange = (e, index) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      // Empty input
      const newDigits = [...digits];
      newDigits[index] = '';
      onChange(newDigits.join(''));
      return;
    }

    // Single digit entry
    const char = rawVal[rawVal.length - 1];
    const newDigits = [...digits];
    newDigits[index] = char;
    const combined = newDigits.join('');
    onChange(combined);

    // Auto-advance
    if (index < length - 1 && char) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move to previous and clear
        inputsRef.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        e.preventDefault();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, length);
    if (!pasted) return;

    onChange(pasted);
    const targetIdx = Math.min(pasted.length, length - 1);
    inputsRef.current[targetIdx]?.focus();
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        margin: '18px 0',
        width: '100%'
      }}
      onPaste={handlePaste}
    >
      {Array.from({ length }).map((_, index) => {
        const isMiddle = index === 2; // divider after 3rd digit
        const digit = digits[index] || '';
        const isFilled = Boolean(digit);

        return (
          <React.Fragment key={index}>
            <input
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              disabled={disabled}
              onChange={(e) => handleInputChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              aria-label={`Verification code digit ${index + 1}`}
              style={{
                width: '46px',
                height: '54px',
                borderRadius: '12px',
                textAlign: 'center',
                fontSize: '24px',
                fontWeight: 900,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                color: isRoleAdmin ? 'var(--amber, #f59e0b)' : 'var(--primary, #10b981)',
                background: 'rgba(11, 15, 25, 0.85)',
                border: error
                  ? '2px solid var(--rose, #f43f5e)'
                  : isFilled
                  ? `2px solid ${activeColor}`
                  : '1.5px solid rgba(255, 255, 255, 0.12)',
                boxShadow: isFilled ? `0 0 14px ${activeGlow}` : 'none',
                outline: 'none',
                transition: 'all 0.18s ease',
                caretColor: activeColor
              }}
              onFocus={(e) => {
                e.target.style.borderColor = activeColor;
                e.target.style.boxShadow = `0 0 16px ${activeGlow}`;
                e.target.select();
              }}
              onBlur={(e) => {
                if (!digit) {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            />
            {isMiddle && (
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: 'rgba(255, 255, 255, 0.25)',
                  margin: '0 2px',
                  userSelect: 'none'
                }}
              >
                —
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

