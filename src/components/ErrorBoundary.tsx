import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ErrorBanner } from './ErrorBanner'
import { BUTTON_SECONDARY_CLASSES } from '../lib/formStyles'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

// Ловит неожиданные ошибки на странице, чтобы вместо белого экрана было понятное сообщение
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="space-y-3">
        <ErrorBanner>
          Что-то пошло не так на этой странице: {this.state.error.message}
        </ErrorBanner>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`${BUTTON_SECONDARY_CLASSES} min-h-11`}
            onClick={() => window.location.reload()}
          >
            Перезагрузить
          </button>
          <Link to="/settings" className={`${BUTTON_SECONDARY_CLASSES} min-h-11`}>
            Открыть «Данные»
          </Link>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary
