import { KanbanBoard } from './components/KanbanBoard';
import { MilestoneProvider } from './contexts/MilestoneContext';
import { Toaster } from 'sonner';

function App() {
  return (
    <MilestoneProvider>
      <div className="min-h-screen">
        <KanbanBoard />
        <Toaster position="top-right" />
      </div>
    </MilestoneProvider>
  );
}

export default App;