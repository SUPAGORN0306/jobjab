/**
 * PageLoader.jsx: Loading spinner component displayed centered with a message.
 *
 * @example
 *   if (loading) return <PageLoader message="Loading analytics..." />;
 */
export default function PageLoader({ message = 'Loading...', fullPage = false }) {
  return (
    <div className={`page-loader ${fullPage ? 'page-loader-full' : ''}`}>
      <div className="page-loader-spinner" />
      <p className="page-loader-text">{message}</p>
    </div>
  );
}
