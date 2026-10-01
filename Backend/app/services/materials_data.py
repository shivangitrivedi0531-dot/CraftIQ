"""
CONTRACT: this mirrors src/data/dummyData.js's DUMMY_CALCULATOR_MATERIALS on the
frontend. Only candle, resin, crochet have a calculator (see frontend
categories.js hasCalculator flag) - the other two categories aren't routed here.
Keep names/costs in sync with the frontend if either side changes.
"""

MATERIALS = {
    "candle": [
        {"name": "Soy Wax (per kg)", "cost": 300},
        {"name": "Wick (per piece)", "cost": 20},
        {"name": "Fragrance Oil (per ml)", "cost": 5},
        {"name": "Container (per piece)", "cost": 40},
    ],
    "resin": [
        {"name": "Epoxy Resin (per liter)", "cost": 800},
        {"name": "Hardener (per liter)", "cost": 400},
        {"name": "Mold (per unit)", "cost": 150},
        {"name": "Colorant (per gram)", "cost": 2},
    ],
    "crochet": [
        {"name": "Yarn (per 100g)", "cost": 150},
        {"name": "Crochet Hook (per set)", "cost": 200},
        {"name": "Stuffing (per 250g pack)", "cost": 120},
    ],
}

MARKUP_MULTIPLIER = 2.5  # matches the frontend's suggested-price formula