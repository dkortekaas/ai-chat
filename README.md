# EmbedIQ

A modern, fully functional EmbedIQ platform built with Next.js 15, TypeScript, and Prisma. This platform enables users to create EmbedIQbots, upload and process documents, manage knowledge bases, and view comprehensive analytics with a complete notification system.

## 🚀 Features

### 📊 Dashboard

- **Overview**: Central dashboard with key statistics
- **Quick Actions**: Direct access to frequently used functions
- **Real-time Updates**: Live data from conversations and documents
- **Assistant Switcher**: Easy switching between multiple AI assistants
- **Notification Bell**: Real-time notifications with unread count

### 📄 Document Management

- **Multi-format Support**: PDF, DOCX, TXT, JPG, PNG files
- **URL Processing**: Automatic processing of website content
- **Drag & Drop Upload**: Intuitive file upload interface
- **Document Viewer**: Built-in viewer for document preview
- **Chunking & Embedding**: Automatic text processing for AI optimization
- **Status Tracking**: Real-time processing status (PROCESSING, COMPLETED, FAILED)
- **Metadata Extraction**: Automatic extraction of document information
- **File Management**: Edit, delete, and organize uploaded files

### 🌐 Website Scraping & RAG Integration

- **Intelligent Web Scraping**: Automatic content extraction from websites
- **Multi-page Crawling**: Recursive scraping with configurable depth
- **Content Processing**: Smart text extraction focusing on main content areas
- **Link Discovery**: Automatic extraction and storage of all found links
- **Vector Embeddings**: OpenAI embeddings for semantic search
- **Document Chunking**: Intelligent text chunking with context preservation
- **RAG Integration**: Full integration with Retrieval-Augmented Generation
- **Real-time Processing**: Background scraping with status tracking
- **Content View**: Dedicated page for viewing scraped content and links
- **Manual Scraping**: On-demand re-scraping functionality

### 🤖 AI Assistant Management

- **Multiple Assistants**: Create and manage multiple AI assistants
- **Customizable Settings**:
  - Name, description, and welcome message
  - Color scheme (primary and secondary colors)
  - Font family and styling options
  - Avatar selection
  - Tone (professional, friendly, casual)
  - Temperature and response length
  - Fallback messages
- **Embed Code**: Easy integration on websites
- **Live Preview**: Real-time preview of chatbot appearance
- **API Key Management**: Secure access to chatbot functionality
- **Domain Whitelisting**: Restricted access to specific domains
- **Rate Limiting**: Configurable user limits

### 🎯 Action Buttons

- **Quick Buttons**: Pre-configured buttons for common user interactions
- **Custom Questions**: Associate specific questions with buttons
- **Priority Management**: Set button priority for ordering
- **Enable/Disable**: Toggle buttons on/off
- **CRUD Operations**: Create, edit, and delete action buttons
- **Database Storage**: All buttons stored and managed in database

### 🗄️ Knowledge Base (Kennisbank)

- **Website Integration**: Sync and process website content
- **Intelligent Web Scraping**: Automatic content extraction with multi-page crawling
- **RAG Integration**: Full vector search and semantic understanding
- **Content View**: Dedicated interface for viewing scraped website content
- **Link Discovery**: Automatic extraction and management of website links
- **FAQ Management**: Create and manage frequently asked questions
- **File Upload**: Upload knowledge files for AI training
- **Content Organization**: Organize knowledge by categories
- **Sync Management**: Control website synchronization settings
- **Status Tracking**: Monitor processing status of knowledge sources

### 💬 Conversation Management

- **Complete Session Tracking**: Full conversation sessions with all messages
- **Message History**: Individual user and assistant messages with timestamps
- **Session Analytics**: Session duration, message count, token usage per session
- **Source Attribution**: Which documents were used for each specific answer
- **Performance Metrics**: Response time, token usage, confidence scores per message
- **Rating System**: 1-5 star ratings with comments for entire sessions
- **Advanced Filtering**: Filter by type, time, duration, and rating
- **Expandable Views**: Click to expand and see full conversation flow
- **Session Statistics**: Total sessions, active sessions, average messages per session
- **Real-time Updates**: Live conversation data and statistics
- **Export Functionality**: Export conversations for analysis

### 📈 Analytics & Reporting

- **Session Statistics**:
  - Total conversation sessions
  - Active sessions (last 24 hours)
  - Total messages across all sessions
  - Average messages per session
- **Performance Metrics**:
  - Response time analytics
  - Token usage tracking
  - Confidence score monitoring
  - Model performance insights
- **Rating Distribution**: Visual representation of session ratings
- **Top Questions**: Most asked questions with trends
- **Conversation Charts**: Timeline of chat activity and session patterns
- **Source Analytics**: Which knowledge sources are most effective
- **User Behavior**: Session duration and engagement patterns

### 🔔 Notification System

- **Real-time Notifications**: Bell icon in header with unread count
- **Notification Dropdown**: Quick access to recent notifications
- **Full Notification Page**: Complete notification management
- **Admin Panel**: Superuser interface for creating notifications
- **Notification Types**: INFO, WARNING, ERROR, SUCCESS, MAINTENANCE
- **Priority Levels**: LOW, MEDIUM, HIGH, URGENT
- **Target Users**: Send to specific users or all users
- **Expiration Dates**: Set automatic expiration for notifications
- **Mark as Read**: Individual and bulk read status management
- **Table View**: Clean tabular interface for admin management

### 👥 User Management (Superuser Only)

- **User Overview**: Complete list of all users in the system
- **Table Interface**: Clean tabular view with user details
- **User Creation**: Create new users with custom roles
- **User Editing**: Update user information, roles, and passwords
- **User Deletion**: Remove users from the system (with safety checks)
- **Role Management**: Assign SUPERUSER, ADMIN, or USER roles
- **User Statistics**: View assistant count and activity per user
- **Security Features**: Cannot delete own account, email uniqueness validation

### 🔐 Authentication & Security

- **NextAuth.js Integration**: Secure user authentication
- **Role-based Access**: SUPERUSER, ADMIN, and USER roles
- **Session Management**: Secure session handling with role information
- **API Security**: Protected endpoints with authentication
- **Password Security**: bcryptjs password hashing

### 💳 Subscription & Billing System

- **Trial Period**: 30-day free trial for all new users
- **4 Subscription Plans**:
  - **Starter**: €19/month - 1 chatbot, 100 conversations/month
  - **Professional**: €49/month - 3 chatbots, 500 conversations/month
  - **Business**: €149/month - 10 chatbots, 2000 conversations/month
  - **Enterprise**: €499/month - Unlimited chatbots and conversations
- **Stripe Integration**: Secure payment processing and subscription management
- **Automatic Billing**: Recurring monthly payments
- **Subscription Management**: Users can manage their subscriptions via Stripe portal
- **Trial Tracking**: Real-time trial status and days remaining
- **Usage Limits**: Automatic enforcement of plan limits
- **Upgrade Prompts**: Seamless upgrade flow when limits are reached

### ⚙️ Settings & Configuration

- **Look & Feel**: Customize chatbot appearance and behavior
- **Action Buttons**: Manage quick interaction buttons
- **Forms**: Configure form settings and integrations
- **Integrations**: API and third-party service configurations
- **Widget Settings**: Embed code and widget customization
- **User Account**: Profile management and password changes
- **Team Management**: User roles and permissions
- **Subscription Management**: Billing, plan upgrades, and usage tracking

### 🔍 RAG (Retrieval-Augmented Generation) System

- **Vector Embeddings**: OpenAI text-embedding-3-small for semantic search
- **Document Chunking**: Intelligent text splitting with context preservation
- **Semantic Search**: Meaning-based search, not just keyword matching
- **Hybrid Search**: Combines semantic and keyword search for best results
- **Website Integration**: Automatic processing of scraped website content
- **Real-time Indexing**: New content automatically becomes searchable
- **Source Attribution**: AI responses include source references
- **Multi-language Support**: Works with Dutch and English content
- **Scalable Architecture**: Handles thousands of documents efficiently

### 🌍 Internationalization (i18n)

- **Full Multi-language Support**: Complete interface translations for 5 languages
  - **Dutch (nl)**: Default language with full translation coverage
  - **English (en)**: Complete English translation
  - **German (de)**: Full German interface translation
  - **French (fr)**: Complete French translation
  - **Spanish (es)**: Full Spanish interface translation
- **next-intl Integration**: Powered by next-intl for seamless internationalization
- **User Language Preference**: Users can select their preferred interface language
- **Language Persistence**: Language preference saved and remembered
- **Comprehensive Translations**: All UI elements, error messages, and notifications translated
- **Locale-based Routing**: URL-based locale switching (e.g., `/nl/`, `/en/`, `/de/`)
- **Translation Files**: Organized JSON files in `messages/` directory
- **Language Selector**: Easy language switching in settings and header
- **Complete Coverage**: 1250+ translated strings per language

## 🛠️ Technology Stack

### Frontend

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component library
- **React Hook Form**: Form management
- **Zod**: Schema validation
- **TanStack Query**: Data fetching and caching
- **next-intl**: Internationalization library for multi-language support

### Backend

- **Next.js API Routes**: Serverless API endpoints
- **Prisma**: Database ORM
- **PostgreSQL**: Primary database with pgvector extension
- **NextAuth.js**: Authentication
- **bcryptjs**: Password hashing
- **Stripe**: Payment processing and subscription management
- **OpenAI**: AI embeddings and chat completions
- **JSDOM**: Server-side HTML parsing for web scraping

### Development Tools

- **ESLint**: Code linting
- **TypeScript**: Static type checking
- **Turbopack**: Fast development builds

## 📁 Project Structure

```
ai-chat-platform/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   │   ├── login/         # Login page
│   │   ├── signup/        # Registration page
│   │   └── forgot-password/ # Password reset
│   ├── (dashboard)/       # Main application pages
│   │   ├── account/       # User account management
│   │   ├── analytics/     # Analytics dashboard
│   │   ├── assistants/    # AI assistant management
│   │   ├── conversations/ # Conversation history
│   │   ├── documents/     # Document management
│   │   ├── kennisbank/    # Knowledge base
│   │   ├── notifications/ # User notifications
│   │   ├── admin/         # Admin panel (superusers)
│   │   │   ├── users/     # User management
│   │   │   ├── subscriptions/ # Subscription overview
│   │   │   └── notifications/ # Admin notifications
│   │   └── settings/      # Application settings
│   └── api/               # API routes
│       ├── auth/          # Authentication endpoints
│       ├── assistants/    # Assistant CRUD operations
│       ├── action-buttons/ # Action button management
│       ├── notifications/ # Notification system
│       ├── subscriptions/ # Subscription management
│       ├── stripe/        # Stripe webhooks
│       ├── faqs/          # FAQ management
│       ├── websites/      # Website integration
│       ├── files/         # File upload/management
│       └── analytics/     # Analytics data
├── components/            # React components
│   ├── account/           # Account management
│   ├── analytics/         # Analytics components
│   ├── auth/              # Authentication components
│   ├── chatbot/           # Chatbot components
│   ├── conversations/     # Conversation components
│   ├── dashboard/         # Dashboard components
│   ├── documents/         # Document management
│   ├── kennisbank/        # Knowledge base components
│   ├── settings/          # Settings components
│   ├── shared/            # Shared components
│   └── ui/                # UI components
├── contexts/              # React contexts
├── hooks/                 # Custom React hooks
├── i18n/                  # Internationalization configuration
│   ├── routing.ts        # Locale routing configuration
│   └── request.ts        # Request configuration for i18n
├── lib/                   # Utility libraries
├── messages/              # Translation files
│   ├── nl.json           # Dutch translations
│   ├── en.json           # English translations
│   ├── de.json           # German translations
│   ├── fr.json           # French translations
│   └── es.json           # Spanish translations
├── prisma/                # Database schema and migrations
│   ├── migrations/        # Database migrations
│   └── seed.ts           # Database seeding
└── types/                 # TypeScript type definitions
```

## 🚀 Installation & Setup

### Requirements

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ai-chat-platform
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in the following variables:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/ai_chat_platform"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # Stripe Configuration
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   STRIPE_STARTER_PRICE_ID="price_..."
   STRIPE_PROFESSIONAL_PRICE_ID="price_..."
   STRIPE_BUSINESS_PRICE_ID="price_..."
   STRIPE_ENTERPRISE_PRICE_ID="price_..."
   ```

4. **Setup database**

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Seed the database with test data**

   ```bash
   npm run db:seed
   ```

   This creates test accounts:
   - **Superuser**: `superuser@example.com` / `superuser123` (Enterprise plan)
   - **Admin**: `admin@example.com` / `admin123` (Business plan)
   - **User**: `user@example.com` / `user123` (30-day trial)

6. **Start development server**

   ```bash
   npm run dev
   ```

7. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🧪 Test Accounts

After running the seed script, you can login with these test accounts:

| Role          | Email                   | Password       | Access Level                          | Subscription |
| ------------- | ----------------------- | -------------- | ------------------------------------- | ------------ |
| **Superuser** | `superuser@example.com` | `superuser123` | Full access + subscription management | Enterprise   |
| **Admin**     | `admin@example.com`     | `admin123`     | Standard admin access                 | Business     |
| **User**      | `user@example.com`      | `user123`      | Basic user access                     | 30-day Trial |

## 🚀 Quick Start Guide

### For Superusers

1. Login with `superuser@example.com`
2. **Manage Users** in the **Users** section
3. **View Subscriptions** in the **Subscriptions** section
4. Create notifications in **Admin Notificaties**
5. Create and manage assistants
6. Monitor analytics and user activity
7. Access clean table interfaces for admin management

### For Regular Users

1. Login with `user@example.com` (30-day trial)
2. Create your first AI assistant
3. Upload documents or add websites to knowledge base
4. Configure action buttons for quick interactions
5. Customize chatbot appearance in settings
6. View notifications via bell icon
7. Monitor conversation analytics
8. **Manage subscription** in Account settings when trial expires

## 🌐 Website Scraping Workflow

### How Website Scraping Works

1. **URL Addition**: User adds a website URL to the knowledge base
2. **Automatic Scraping**: Background process starts scraping the website
3. **Content Extraction**:
   - Main content areas are identified and extracted
   - All links are discovered and stored
   - Text is cleaned and normalized
4. **Multi-page Crawling**:
   - Recursively scrapes linked pages (configurable depth)
   - Respects same-domain policy
   - Limits concurrent requests
5. **Document Processing**:
   - Content is chunked into manageable pieces (1000 chars with 200 overlap)
   - OpenAI embeddings are generated for each chunk
   - Chunks are stored in database with vector embeddings
6. **RAG Integration**:
   - Content becomes searchable via semantic search
   - AI can now answer questions based on scraped content
   - Source attribution is maintained

### Content View Features

- **Dedicated Content Page**: View all scraped content in organized interface
- **Website Information**: Status, page count, last sync, error messages
- **Content Display**: Full scraped text in readable format
- **Link Management**: All discovered links with external navigation
- **Individual Pages**: Detailed view of each scraped page
- **Manual Scraping**: Re-scrape websites on demand
- **Status Tracking**: Real-time processing status updates

## 📖 Usage

### Getting Started

1. **Login with test account** or register a new account
2. **Create an AI Assistant** in the Assistants section
3. **Add websites** to the Knowledge Base for automatic scraping
4. **Upload documents** or create FAQs for additional knowledge
5. **Configure action buttons** for quick user interactions
6. **View scraped content** in the dedicated content view pages
7. **Customize appearance** in Settings
8. **Copy the embed code** and add to your website
9. **Monitor performance** with analytics

### User Roles

- **SUPERUSER**: Full access including user management and notification management
- **ADMIN**: Standard admin access to all features
- **USER**: Basic user access to create and manage assistants

### AI Assistant Management

- Create multiple assistants for different use cases
- Customize appearance, behavior, and responses
- Set up domain restrictions and rate limits
- Generate embed codes for website integration

### Knowledge Base (Kennisbank)

- **Websites**: Add and sync website content automatically
- **Intelligent Scraping**: Multi-page crawling with content extraction
- **RAG Integration**: Vector embeddings for semantic search
- **Content View**: Dedicated page for viewing scraped content and links
- **FAQs**: Create frequently asked questions
- **Files**: Upload knowledge files (PDF, DOCX, TXT, etc.)
- **Organization**: Categorize and manage knowledge sources

### Action Buttons

- Create quick interaction buttons for common questions
- Set priorities and enable/disable buttons
- Associate specific questions with button clicks
- All buttons stored in database for persistence

### User Management (Superuser Only)

- **User Overview**: View all users in a clean table interface
- **Create Users**: Add new users with custom roles and passwords
- **Edit Users**: Update user information, roles, and passwords
- **Delete Users**: Remove users from the system (with safety checks)
- **Role Assignment**: Assign SUPERUSER, ADMIN, or USER roles
- **User Statistics**: View assistant count and activity per user
- **Security**: Cannot delete own account, email uniqueness validation

### Subscription Management

- **Trial Period**: All new users get 30 days free trial
- **Plan Selection**: Choose from 4 subscription plans
- **Stripe Integration**: Secure payment processing
- **Usage Tracking**: Monitor chatbot and conversation limits
- **Upgrade Flow**: Seamless upgrade when limits are reached
- **Billing Portal**: Users can manage payments via Stripe
- **Admin Overview**: Superusers can view all subscriptions and revenue

### Notification System

- **For Users**: View notifications via bell icon or full page
- **For Superusers**: Create and manage system notifications
- **Types**: Info, Warning, Error, Success, Maintenance
- **Targeting**: Send to specific users or all users
- **Expiration**: Set automatic expiration dates
- **Table Interface**: Clean admin interface for notification management

### Document Upload

- Supported formats: PDF, DOCX, TXT, JPG, PNG
- Maximum file size: 10MB
- Drag & drop or click to upload
- Automatic processing and chunking
- Status tracking and error handling

### Chatbot Configuration

- Customize appearance with colors and styling
- Set behavior with temperature and response length
- Configure welcome messages and fallback texts
- Test with live preview
- Multiple customization tabs for different aspects

### Viewing Analytics

- Dashboard with overview statistics
- Conversation trends and patterns
- Rating analyses and user feedback
- Performance metrics and optimization tips
- Detailed conversation analytics

### Conversation Management

- **Session Overview**: View all conversation sessions with key metrics
- **Expandable Details**: Click any session to see the complete conversation flow
- **Message History**: See every user question and assistant response in chronological order
- **Source Tracking**: View which documents were used for each specific answer
- **Performance Metrics**: Response times, confidence scores, and token usage per message
- **Session Analytics**: Duration, message count, and engagement patterns
- **Advanced Filtering**: Filter by conversation type, time period, duration, and ratings
- **Real-time Statistics**: Live updates of session counts and activity metrics
- **Rating System**: Rate entire conversation sessions with comments
- **Export Options**: Export conversation data for analysis

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### Assistants

- `GET /api/assistants` - List user's assistants
- `POST /api/assistants` - Create new assistant
- `GET /api/assistants/[id]` - Get assistant details
- `PUT /api/assistants/[id]` - Update assistant
- `DELETE /api/assistants/[id]` - Delete assistant

### Action Buttons

- `GET /api/action-buttons` - List action buttons for assistant
- `POST /api/action-buttons` - Create action button
- `GET /api/action-buttons/[id]` - Get action button details
- `PUT /api/action-buttons/[id]` - Update action button
- `DELETE /api/action-buttons/[id]` - Delete action button

### Notifications

- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification (superusers only)
- `GET /api/notifications/[id]` - Get notification details
- `PUT /api/notifications/[id]` - Update notification
- `DELETE /api/notifications/[id]` - Delete notification (superusers only)
- `GET /api/notifications/admin` - Get all notifications (superusers only)

### Admin User Management

- `GET /api/admin/users` - List all users (superusers only)
- `POST /api/admin/users` - Create new user (superusers only)
- `GET /api/admin/users/[id]` - Get user details (superusers only)
- `PUT /api/admin/users/[id]` - Update user (superusers only)
- `DELETE /api/admin/users/[id]` - Delete user (superusers only)

### Subscription Management

- `GET /api/subscriptions` - Get user subscription status
- `POST /api/subscriptions` - Create new subscription
- `GET /api/subscriptions/manage` - Open Stripe billing portal
- `GET /api/admin/subscriptions` - Get all subscriptions (superusers only)
- `POST /api/stripe/webhook` - Stripe webhook handler

### Knowledge Base

#### Websites

- `GET /api/websites` - List websites for assistant
- `POST /api/websites` - Add website
- `GET /api/websites/[id]` - Get website details
- `PUT /api/websites/[id]` - Update website
- `DELETE /api/websites/[id]` - Delete website

#### FAQs

- `GET /api/faqs` - List FAQs for assistant
- `POST /api/faqs` - Create FAQ
- `GET /api/faqs/[id]` - Get FAQ details
- `PUT /api/faqs/[id]` - Update FAQ
- `DELETE /api/faqs/[id]` - Delete FAQ

#### Files

- `GET /api/files` - List knowledge files
- `POST /api/files` - Upload knowledge file
- `GET /api/files/[id]` - Get file details
- `DELETE /api/files/[id]` - Delete file
- `GET /api/files/[id]/download` - Download file

### Documents

- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - List documents
- `GET /api/documents/[id]` - Document details
- `DELETE /api/documents/[id]` - Delete document

### Conversations

#### Session Management

- `GET /api/conversations/sessions` - List conversation sessions
- `GET /api/conversations/sessions/stats` - Session statistics
- `POST /api/conversations/sessions/[id]/rate` - Rate conversation session

#### Chat API

- `POST /api/chat/message` - Send message and receive response
- **Features**: Automatic session creation, message storage, source tracking

### Analytics

- `GET /api/analytics/stats` - Overview statistics
- `GET /api/analytics/conversations` - Conversation data
- `GET /api/analytics/ratings` - Rating data

## 🗄️ Database Schema

### Key Models

#### User Management

- **User**: Users with role-based access (SUPERUSER, ADMIN, USER) and subscription data
- **Account**: OAuth account connections
- **Session**: User sessions

#### AI Assistant System

- **Assistant**: AI assistants with full configuration
- **ActionButton**: Quick interaction buttons for assistants
- **Document**: Uploaded documents and metadata
- **DocumentChunk**: Processed text chunks with vector embeddings
- **KnowledgeFile**: Knowledge base files
- **Website**: Website integration for knowledge base with scraping data
- **WebsitePage**: Individual scraped pages with content and links
- **FAQ**: Frequently asked questions

#### Communication

- **ConversationSession**: Complete conversation sessions with metadata
  - Session tracking with unique session IDs
  - Assistant association and user metadata
  - Timing information (start, last activity, duration)
  - Performance metrics (message count, total tokens, avg response time)
  - Rating system for entire sessions
- **ConversationMessage**: Individual messages (USER, ASSISTANT, SYSTEM)
  - Message type classification
  - Content and timestamps
  - Performance data (response time, tokens used, confidence)
  - Model information and source attribution
- **ConversationSource**: Sources used in specific messages
  - Links to documents and message content
  - Relevance scores for source effectiveness
  - Flexible linking to both messages and legacy conversations
- **Conversation**: Legacy conversation model (for backward compatibility)
- **Notification**: System notifications with targeting

#### System

- **SystemLog**: System logging and debugging
- **VerificationToken**: Email verification tokens

## 💳 Stripe Setup Guide

### 1. Stripe Account Aanmaken

1. **Ga naar [stripe.com](https://stripe.com)** en maak een account aan
2. **Verifieer je account** met je bedrijfsgegevens
3. **Activeer je account** (dit kan even duren voor verificatie)

### 2. Stripe Dashboard Configuratie

#### Producten en Prijzen Aanmaken

1. **Ga naar je Stripe Dashboard** → **Products**
2. **Maak 4 producten aan** voor elk abonnement:

**Starter Plan:**

- Product naam: "Starter Plan"
- Prijs: €19.00
- Billing: Recurring (monthly)
- Kopieer de **Price ID** (begint met `price_`)

**Professional Plan:**

- Product naam: "Professional Plan"
- Prijs: €49.00
- Billing: Recurring (monthly)
- Kopieer de **Price ID**

**Business Plan:**

- Product naam: "Business Plan"
- Prijs: €149.00
- Billing: Recurring (monthly)
- Kopieer de **Price ID**

**Enterprise Plan:**

- Product naam: "Enterprise Plan"
- Prijs: €499.00
- Billing: Recurring (monthly)
- Kopieer de **Price ID**

### 3. API Keys Ophalen

1. **Ga naar Developers** → **API Keys**
2. **Kopieer je Secret Key** (begint met `sk_test_` voor test mode)
3. **Kopieer je Publishable Key** (begint met `pk_test_` voor test mode)

### 4. Webhook Configuratie

1. **Ga naar Developers** → **Webhooks**
2. **Klik op "Add endpoint"**
3. **Endpoint URL**: `https://jouw-domein.com/api/stripe/webhook`
4. **Events to send**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. **Kopieer de Webhook Secret** (begint met `whsec_`)

### 5. OpenAI API Key Configureren

Voor de RAG functionaliteit en website scraping heb je een OpenAI API key nodig:

1. **Ga naar [OpenAI Platform](https://platform.openai.com/)**
2. **Maak een account** of log in
3. **Ga naar API Keys** in het menu
4. **Klik op "Create new secret key"**
5. **Kopieer de API key** (begint met `sk-`)
6. **Voeg toe aan je `.env.local` bestand**

**Belangrijk**:

- De API key is nodig voor vector embeddings en semantic search
- Zonder API key werkt website scraping wel, maar geen RAG functionaliteit
- Kosten zijn ongeveer $0.02 per 1M tokens voor embeddings

### 6. Environment Variables Instellen

Update je `.env.local` bestand:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ai_chat_platform"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_51ABC123..."
STRIPE_WEBHOOK_SECRET="whsec_ABC123..."
STRIPE_STARTER_PRICE_ID="price_1ABC123..."
STRIPE_PROFESSIONAL_PRICE_ID="price_1DEF456..."
STRIPE_BUSINESS_PRICE_ID="price_1GHI789..."
STRIPE_ENTERPRISE_PRICE_ID="price_1JKL012..."

# OpenAI Configuration (Required for RAG and embeddings)
OPENAI_API_KEY="sk-..."
```

### 7. Test Cards

Voor testing kun je deze Stripe test cards gebruiken:

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Requires 3D Secure: 4000 0025 0000 3155
```

**Test Details:**

- **Expiry**: Elke toekomstige datum (bijv. 12/25)
- **CVC**: Elke 3-cijferige code (bijv. 123)
- **ZIP**: Elke postcode (bijv. 12345)

### 7. Database Migratie Uitvoeren

```bash
# Zorg dat je database up-to-date is
npx prisma migrate deploy
npx prisma generate

# Seed de database met test accounts
npm run db:seed
```

### 8. Testen

1. **Login** met `user@example.com` / `user123` (trial account)
2. **Ga naar Account** → **Subscription tab**
3. **Klik op "Upgrade"** bij een abonnement
4. **Gebruik test card** `4242 4242 4242 4242`
5. **Controleer** of de subscription wordt aangemaakt

### 9. Production Setup

Voor productie:

1. **Schakel over naar Live mode** in Stripe Dashboard
2. **Vervang test keys** met live keys in environment variables
3. **Update webhook URL** naar je productie domein
4. **Test met echte betalingen** (kleine bedragen)

### 🔍 Troubleshooting

**Webhook niet werkt?**

- Controleer of de webhook URL correct is
- Zorg dat je server bereikbaar is vanaf internet
- Check de webhook logs in Stripe Dashboard

**Subscription wordt niet aangemaakt?**

- Controleer of alle Price IDs correct zijn
- Check de browser console voor errors
- Controleer de server logs

**Payment fails?**

- Gebruik de juiste test cards
- Controleer of je Stripe account geactiveerd is
- Check of je in test mode bent

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository with Vercel
3. Configure environment variables (inclusief Stripe keys)
4. Deploy automatically

### Other Platforms

- **Railway**: For PostgreSQL hosting
- **Supabase**: Database and authentication
- **Docker**: Container deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆕 Recent Features

### v2.3.0 - Internationalization (i18n)

- ✅ **Full Multi-language Support**: Complete translations for 5 languages (Dutch, English, German, French, Spanish)
- ✅ **next-intl Integration**: Seamless internationalization powered by next-intl
- ✅ **User Language Preference**: Language selector in settings and header
- ✅ **Comprehensive Translations**: 1250+ translated strings per language
- ✅ **Locale-based Routing**: URL-based language switching
- ✅ **Translation Files**: Organized JSON files for easy maintenance
- ✅ **Complete Coverage**: All UI elements, error messages, and notifications translated

### v2.2.0 - Advanced Conversation Management

- ✅ **Complete Session Tracking**: Full conversation sessions with all messages
- ✅ **Message History**: Individual user and assistant messages with timestamps
- ✅ **Session Analytics**: Duration, message count, token usage per session
- ✅ **Source Attribution**: Document sources linked to specific messages
- ✅ **Performance Metrics**: Response time, confidence scores per message
- ✅ **Expandable Views**: Click to expand and see full conversation flow
- ✅ **Advanced Filtering**: Filter by type, time, duration, and rating
- ✅ **Session Statistics**: Total sessions, active sessions, average messages
- ✅ **Real-time Updates**: Live conversation data and statistics
- ✅ **Database Schema**: New ConversationSession and ConversationMessage models

### v2.1.0 - Subscription & Billing System

- ✅ **Subscription Management**: Complete Stripe integration with 4 plans
- ✅ **Trial Period**: 30-day free trial for all new users
- ✅ **Usage Limits**: Automatic enforcement of plan limits
- ✅ **Billing Portal**: Users can manage subscriptions via Stripe
- ✅ **Admin Overview**: Superuser subscription management dashboard
- ✅ **Revenue Tracking**: Monthly revenue and subscription statistics
- ✅ **Upgrade Flow**: Seamless upgrade prompts when limits reached

### v2.0.0 - Complete Platform Overhaul

- ✅ **Multi-Assistant System**: Create and manage multiple AI assistants
- ✅ **Action Buttons**: Pre-configured quick interaction buttons
- ✅ **Knowledge Base**: Website integration, FAQs, and file management
- ✅ **Notification System**: Real-time notifications with admin panel
- ✅ **User Management**: Complete user CRUD with role-based access
- ✅ **Role-based Access**: SUPERUSER, ADMIN, and USER roles
- ✅ **Enhanced Analytics**: Detailed conversation and performance metrics
- ✅ **Improved UI/UX**: Modern interface with table-based admin views
- ✅ **Database Seeding**: Test accounts and sample data

### v1.0.0 - Initial Release

- ✅ Basic chatbot functionality
- ✅ Document upload and processing
- ✅ Conversation management
- ✅ Basic analytics
- ✅ User authentication

## 🔄 Changelog

### Latest Updates

- **Internationalization (i18n)**: Full multi-language support with 5 languages (Dutch, English, German, French, Spanish)
- **next-intl Integration**: Complete internationalization system with locale-based routing
- **Language Preference**: User-selectable interface language with persistence
- **Comprehensive Translations**: All UI elements, error messages, notifications, and form validations translated
- **Translation Files**: Complete JSON translation files for nl, en, de, fr, and es
- **Advanced Conversation Management**: Complete session tracking with individual message storage
- **Session Analytics**: Duration, message count, token usage, and performance metrics per session
- **Source Attribution**: Document sources linked to specific messages for better transparency
- **Expandable Conversation Views**: Click to expand and see full conversation flow with all messages
- **Advanced Filtering**: Filter conversations by type, time, duration, and rating
- **Real-time Statistics**: Live updates of session counts, active sessions, and message totals
- **Database Schema Enhancement**: New ConversationSession and ConversationMessage models
- **Performance Monitoring**: Response time, confidence scores, and token usage per message
- **Subscription & Billing System**: Complete Stripe integration with 4 subscription plans
- **Trial Management**: 30-day free trial with automatic tracking and upgrade prompts
- **Usage Limits**: Automatic enforcement of plan limits for chatbots and conversations
- **Admin Subscription Dashboard**: Superuser overview of all subscriptions and revenue
- **Stripe Webhooks**: Automatic subscription status updates and billing management
- **User Management System**: Complete user CRUD interface for superusers
- **Table-based Admin Interface**: Clean tabular views for users, subscriptions, and notifications
- **Enhanced Role-based Access**: SUPERUSER-only user management features
- **Notification System**: Complete notification management with bell icon, dropdown, and admin panel
- **Action Buttons**: Database-stored quick interaction buttons with CRUD operations
- **Multi-Assistant Support**: Create and switch between multiple AI assistants
- **Knowledge Base**: Website sync, FAQ management, and file uploads
- **Role-based Security**: Enhanced user roles with SUPERUSER privileges
- **Database Seeding**: Automated test data creation with subscription data
- **Enhanced UI**: Improved navigation and user experience

## 🆘 Support

For questions or issues:

- Open a GitHub issue
- Check the documentation
- Contact the developers

## 📝 License

This project is licensed under the MIT License.

---

**Made with ❤️ for modern EmbedIQ solutions**
