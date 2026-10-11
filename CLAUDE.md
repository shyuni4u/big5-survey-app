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

### Python ML Model Development (dormant)
The app no longer runs a model; these tools are kept for a future real-data retrain. Located in `src/scripts/`:
- `python -m venv venv` - Create Python virtual environment
- `.\venv\Scripts\activate` - Activate virtual environment (Windows)
- `pip install -r requirements.txt` - Install Python dependencies
- `npm run dataset -- --env .env.local` - Build `src/scripts/data/<game>.csv` from Supabase rows plus synthetic fill (needs `src/scripts/profiles/<game>.json`, which is raw-scale and separate from the normalized `big5` in `src/lib/data.ts`)
- `python ml/train.py --csv data/wow.csv --model models/wow/model.pth` - Train a per-game classifier
- `python ml/export_onnx.py --model models/wow/model.pth --onnx <out>/model.onnx` - Export ONNX + labels.json (no browser inference path consumes them today)
- `.\venv\Scripts\tensorboard.exe --logdir=runs` - Monitor training progress

## Architecture Overview

### Application Structure
This is a Big5 personality test application that recommends game classes/specializations based on psychological profiles. Recommendations are computed in the browser by a rule-based scorer (`src/lib/recommend.ts`); there is no model inference at runtime.

### Key Components

**Frontend Architecture:**
- **Next.js App Router** - Uses modern app directory structure
- **Atomic Design Pattern** - Components organized as atoms/molecules/organisms
- **shadcn/ui + Radix UI** - Component library with Tailwind CSS styling
- **TypeScript** - Full type safety throughout codebase

**Recommendation Pipeline:**
- **Rule-based scoring** - `src/lib/recommend.ts` normalizes survey scores against the respondent population (`POPULATION_BASELINE`), then blends role fit (A/E/N vs role archetype) and spec fit (signature-weighted distance to each spec's `big5` profile) 35:65 into a 0–100 score
- **Spec profiles** - Every spec in `src/lib/data.ts` has required `big5` and `signature` fields; `src/lib/recommend.test.ts` enforces distinct profiles (min distance 10) and golden personality archetypes per game
- **Big5 Personality Calculator** - Custom scoring algorithm in `src/lib/personality-calculator.ts`
- **Multi-Game Support** - WoW, Lost Ark, DNF share the same scorer; only the data differs
- **PyTorch Training (dormant)** - `src/scripts/ml/` and `src/scripts/dataset/` are kept for a future real-data model; the app does not run ONNX in the browser anymore

**Data Flow:**
1. User answers Big5 questionnaire (40 questions with weights)
2. Frontend calculates personality scores (E, A, C, N, O)
3. `recommend(game, scores)` ranks every spec of the game synchronously; the result page shows the top 3 with a one-line reason
4. Results stored in Supabase for profile calibration (`src/scripts/profile-calibration.js`) and future model training
5. Visual results displayed with Chart.js radar charts

### Critical Files

**Data & Configuration:**
- `src/lib/data.ts` - Big5 questions, game classes, and core application data
- `src/lib/types.ts` - TypeScript definitions for all data structures
- `next.config.ts` - Image domains for game assets (WoW, Lost Ark, Coupang)

**Recommendation Core:**
- `src/lib/recommend.ts` - Population normalization, role/spec fit, `rankSpecs`, `recommend`
- `src/lib/personality-calculator.ts` - Big5 scoring with weighted questions
- `src/scripts/profile-calibration.js` - Compares a Supabase export with the spec profiles (normalized scale) and prints calibration hints
- `src/scripts/ml/model.py`, `src/scripts/ml/train.py` - Dormant PyTorch model definition and training script

**API & Database:**
- `src/app/api/survey-result/route.ts` - Saves results to Supabase
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Testing
- **Jest + Testing Library** - Component and utility function tests
- **Custom Test Setup** - `jest.setup.js` with module aliases
- **Coverage Exclusions** - Scripts, fonts, and CSS files excluded from coverage

### Game Extension Process
When adding new games (documented in `src/README.md`):
1. Add the game and its classes/specs to `src/lib/data.ts`, including `big5` and `signature` for every spec (the type check fails otherwise)
2. Add image domains to `next.config.ts` remotePatterns
3. Run `npm test` — the data-invariant tests reject duplicate or too-close profiles, and add golden archetype tests for the new game in `src/lib/recommend.test.ts`
4. If the dormant dataset builder should keep working, also add the spec to `src/scripts/profiles/<game>.json` (`npm run dataset` fails without it; `npm test` does not)

### Environment Setup
- **Node.js** - Next.js development environment
- **Python** - Only for the dormant ML training scripts; not needed to run or test the app
- **Supabase** - PostgreSQL database for survey result storage