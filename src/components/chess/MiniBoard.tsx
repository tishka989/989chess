import { Chessboard } from 'react-chessboard'
import { useTheme } from '../../context/ThemeContext'

interface MiniBoardProps {
  fen: string
  size?: number
}

export function MiniBoard({ fen, size = 140 }: MiniBoardProps) {
  const { theme } = useTheme()

  return (
    <div
      className="overflow-hidden rounded-xl shadow-lg"
      style={{ width: size, height: size }}
    >
      <Chessboard
        options={{
          position: fen,
          allowDragging: false,
          boardOrientation: 'white',
          boardStyle: {
            borderRadius: '12px',
          },
          darkSquareStyle: {
            backgroundColor: theme === 'dark' ? '#4a5568' : '#b58863',
          },
          lightSquareStyle: {
            backgroundColor: theme === 'dark' ? '#718096' : '#f0d9b5',
          },
        }}
      />
    </div>
  )
}
