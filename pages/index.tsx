import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Cassette Editor</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen min-w-screen bg-blue-400 md:font-mono">
        <h1 className="text-5xl text-center">
          Cassette Editor
        </h1>
      </main>

      <footer>

      </footer>
    </>
  )
}
