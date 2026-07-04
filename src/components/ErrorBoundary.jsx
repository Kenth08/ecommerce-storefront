import { Component } from 'react'
import { Link } from 'react-router-dom'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Something went wrong</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            An unexpected error occurred. Try again, or head back home.
          </p>
          <div className="mt-2 flex gap-3">
            <button
              onClick={this.handleReset}
              className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
            >
              Try again
            </button>
            <Link
              to="/"
              onClick={this.handleReset}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Go home
            </Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
