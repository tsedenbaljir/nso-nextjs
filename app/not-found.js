"use client"
import Link from 'next/link'

export default function NotFound() {
    return (
        <main style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{
                textAlign: 'center',
                maxWidth: '600px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <img src="/logo.png" alt="404" style={{ width: '100%', height: 'auto' }} />
                </div>
                {/* <h1 style={{
                    fontSize: '6rem',
                    margin: '0',
                    color: '#333',
                    fontWeight: 'bold'
                }}>
                    404
                </h1> */}
                <h2 style={{
                    fontSize: '2rem',
                    margin: '40px 0',
                    color: '#666'
                }}>
                    Хуудас олдсонгүй
                </h2>
                <p style={{
                    fontSize: '1.1rem',
                    color: '#888',
                    marginBottom: '30px',
                    lineHeight: '1.6'
                }}>
                    Уучлаарай, таны хайж буй хуудас байхгүй байна.
                </p>
                <div style={{
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }}>
                    <Link href={`/mn`} style={{
                        padding: '12px 24px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        transition: 'background-color 0.3s'
                    }}>
                        Нүүр хуудас руу буцах
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            transition: 'background-color 0.3s'
                        }}
                    >
                        Буцах
                    </button>
                </div>
            </div>
        </main>
    )
} 