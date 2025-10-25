# ReflectBoard - Product Requirements Document

ReflectBoard is a kanban-style task management tool designed to help teams and individuals manage tasks and easily reflect on daily and weekly progress.

**Experience Qualities**:
1. **Intuitive** - Drag-and-drop operations feel natural and immediate
2. **Reflective** - Encourages regular review and learning from completed work
3. **Efficient** - Quick daily summaries and weekly reviews without friction

**Complexity Level**: Light Application (multiple features with basic state)
- Multiple interconnected features (kanban, LLM summaries, bulk operations) with persistent state management across columns and task relationships

## Essential Features

### Kanban Board Management
- **Functionality**: Five-column kanban board (Todo, In Progress, Today's Done, Weekly Done, Done) with drag-and-drop task movement
- **Purpose**: Visual workflow management with reflection-focused columns for daily and weekly reviews
- **Trigger**: User drags task cards between columns or uses bulk move buttons
- **Progression**: Task creation → Todo → In Progress → Today's Done → Weekly Done → Done
- **Success criteria**: Smooth drag-and-drop with immediate persistence, clear visual feedback

### Task Card System
- **Functionality**: Rich task cards with title, description, stuck flag, stuck reason/solution fields
- **Purpose**: Capture not just what was done but challenges faced and solutions found
- **Trigger**: Click add button, edit existing card, or toggle stuck flag
- **Progression**: Card creation → Field entry → Save → Visual indication if stuck
- **Success criteria**: All task data persists, stuck cards visually distinct, editing feels responsive

### Bulk Operations
- **Functionality**: Move all tasks from Today's Done → Weekly Done and Weekly Done → Done with undo capability
- **Purpose**: Facilitate daily and weekly cleanup without tedious individual moves
- **Trigger**: Click bulk move buttons in column headers
- **Progression**: Button click → Confirmation → Mass move → Toast notification with undo → Auto-dismiss
- **Success criteria**: All tasks move correctly, undo works within time window, clear feedback

### LLM Reflection Summaries
- **Functionality**: Generate structured summaries of Today's Done (JSON) and Weekly Done (Markdown)
- **Purpose**: Transform completed tasks into actionable insights for daily standups and weekly reviews
- **Trigger**: Click summary buttons in respective column headers
- **Progression**: Button click → LLM processing → Formatted output display → Copy to clipboard option
- **Success criteria**: Summaries are relevant and well-structured, processing feels fast

## Edge Case Handling
- **Empty columns**: Show helpful placeholder text encouraging task creation
- **LLM failures**: Graceful error handling with retry option and fallback messaging
- **Drag conflicts**: Prevent simultaneous drags, clear visual feedback for valid drop zones
- **Undo expiration**: Clear visual countdown and automatic toast dismissal
- **Network issues**: Optimistic updates with retry logic for persistence failures

## Design Direction
The design should feel professional yet approachable - like a digital whiteboard that encourages thoughtful reflection. Clean, organized interface that doesn't distract from the task content itself.

## Color Selection
Triadic color scheme to distinguish different workflow stages while maintaining visual harmony.

- **Primary Color**: Deep Blue (oklch(0.45 0.15 240)) - represents focus and productivity, used for main actions and headers
- **Secondary Colors**: 
  - Warm Gray (oklch(0.75 0.02 60)) - for card backgrounds and neutral elements
  - Soft Green (oklch(0.7 0.1 120)) - for completed/done states
- **Accent Color**: Orange (oklch(0.65 0.15 40)) - for stuck flags and urgent attention items
- **Foreground/Background Pairings**:
  - Background (Light Gray oklch(0.98 0.005 60)): Dark Gray text (oklch(0.2 0.01 60)) - Ratio 12.8:1 ✓
  - Primary (Deep Blue oklch(0.45 0.15 240)): White text (oklch(1 0 0)) - Ratio 8.2:1 ✓
  - Accent (Orange oklch(0.65 0.15 40)): White text (oklch(1 0 0)) - Ratio 4.9:1 ✓
  - Card (Warm Gray oklch(0.96 0.02 60)): Dark Gray text (oklch(0.25 0.01 60)) - Ratio 9.1:1 ✓

## Font Selection
Clean, readable typography that works well in both card content and interface elements - Inter for its excellent readability at various sizes.

- **Typographic Hierarchy**:
  - H1 (Board Title): Inter Bold/24px/tight spacing
  - H2 (Column Headers): Inter Semibold/18px/normal spacing  
  - H3 (Card Titles): Inter Medium/16px/normal spacing
  - Body (Card Content): Inter Regular/14px/relaxed line height
  - Small (Metadata): Inter Regular/12px/normal spacing

## Animations
Subtle, purposeful animations that enhance the drag-and-drop experience and provide feedback - focusing on smooth transitions that feel physically accurate.

- **Purposeful Meaning**: Card movements should feel like physical objects with appropriate momentum and settling
- **Hierarchy of Movement**: Priority on drag feedback, then state changes, finally decorative transitions

## Component Selection
- **Components**: Card for task items, Tabs for potential future views, Button for actions, Dialog for task editing, Toast (Sonner) for notifications, Badge for stuck indicators
- **Customizations**: Custom drag overlay component, column layout wrapper, bulk action confirmation dialogs
- **States**: Cards have default, dragging, stuck variants; buttons show loading during LLM calls; columns highlight valid drop zones
- **Icon Selection**: Plus for add actions, ArrowRight for progression, Warning for stuck flag, Copy for summary copying
- **Spacing**: Consistent 4-unit (16px) gaps between cards, 6-unit (24px) column padding, 8-unit (32px) section spacing
- **Mobile**: Single column view with horizontal swipe navigation, simplified drag interactions optimized for touch