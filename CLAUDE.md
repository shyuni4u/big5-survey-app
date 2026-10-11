# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server on localhost:3000
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality checks
- `npm run test` - Run Jest test suite
- `npm run test:watch` - Run tests in watch mode

### Python ML Model Development
Located in `src/scripts/`:
- `python -m venv venv` - Create Python virtual environment
- `.\venv\Scripts\activate` - Activate virtual environment (Windows)
- `pip install -r requirements.txt` - Install Python dependencies
- `python train.py` - Train personality classification model
- `python export_onnx.py` - Convert PyTorch model to ONNX format
- `.\venv\Scripts\tensorboard.exe --logdir=runs/psych_model` - Monitor training progress

## Architecture Overview

### Application Structure
This is a Big5 personality test application that recommends game classes/specializations based on psychological profiles. The app uses a Next.js frontend with AI/ML backend processing.

### Key Components

**Frontend Architecture:**
- **Next.js App Router** - Uses modern app directory structure
- **Atomic Design Pattern** - Components organized as atoms/molecules/organisms
- **shadcn/ui + Radix UI** - Component library with Tailwind CSS styling
- **TypeScript** - Full type safety throughout codebase

**ML/AI Pipeline:**
- **PyTorch Training** - Models trained in Python (`src/scripts/`)
- **ONNX Runtime Web** - Client-side inference using converted models
- **Big5 Personality Calculator** - Custom scoring algorithm in `src/lib/personality-calculator.ts`
- **Multi-Game Support** - Models for WoW, Lost Ark, DNF stored in `/public/models/`

**Data Flow:**
1. User answers Big5 questionnaire (40 questions with weights)
2. Frontend calculates personality scores (E, A, C, N, O)
3. ONNX model predicts top 5 class/spec recommendations
4. Results stored in Supabase for future model training
5. Visual results displayed with Chart.js radar charts

### Critical Files

**Data & Configuration:**
- `src/lib/data.ts` - Big5 questions, game classes, and core application data
- `src/lib/types.ts` - TypeScript definitions for all data structures
- `next.config.ts` - Image domains for game assets (WoW, Lost Ark, Coupang)

**ML/AI Core:**
- `src/lib/onnx.ts` - ONNX model loading and prediction logic
- `src/lib/personality-calculator.ts` - Big5 scoring with weighted questions
- `src/scripts/model.py` - PyTorch neural network definition
- `src/scripts/train.py` - Model training script

**API & Database:**
- `src/app/api/survey-result/route.ts` - Saves results to Supabase
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Testing
- **Jest + Testing Library** - Component and utility function tests
- **Custom Test Setup** - `jest.setup.js` with module aliases
- **Coverage Exclusions** - Scripts, fonts, and CSS files excluded from coverage

### Game Extension Process
When adding new games (documented in `src/README.md`):
1. Update `GAME_NAME` in `src/lib/data.ts`
2. Add image domains to `next.config.ts` remotePatterns
3. Train new model and export to ONNX format
4. Place model files in `/public/models/{game}/`

### Environment Setup
- **Node.js** - Next.js development environment
- **Python** - Required for ML model training and ONNX export
- **Supabase** - PostgreSQL database for survey result storage