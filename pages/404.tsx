import Head from 'next/head';
import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Page Not Found - Blog Platform</title>
        <meta name="description" content="Sorry, the page you visited does not exist" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            Sorry, the page you visited may have been moved, deleted, or does not exist.
          </p>
          
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </Link>
            
            <div className="text-center">
              <Link
                href="/admin"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}