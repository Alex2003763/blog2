import Head from 'next/head';
import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="flex flex-col justify-center min-h-screen py-12 bg-gray-50 sm:px-6 lg:px-8">
      <Head>
        <title>找不到頁面 - 部落格平台</title>
        <meta name="description" content="抱歉，您造訪的頁面不存在" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="mb-4 text-6xl font-bold text-gray-900">404</h1>
          <h2 className="mb-6 text-2xl font-semibold text-gray-700">
            找不到頁面
          </h2>
          <p className="mb-8 text-gray-600">
            抱歉，您造訪的頁面可能已被移動、刪除或不存在。
          </p>
          
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-block px-6 py-3 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              返回首頁
            </Link>
            
            <div className="text-center">
              <Link
                href="/admin"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                管理後台
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}