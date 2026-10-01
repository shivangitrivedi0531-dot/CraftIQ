from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.dependencies.auth import get_current_user
from app.services.materials_data import MATERIALS, MARKUP_MULTIPLIER

router = APIRouter()


class CalculatorRequest(BaseModel):
    quantities: dict[int, float]  # material index (as in MATERIALS[category]) -> quantity


class MaterialLine(BaseModel):
    name: str
    unit_cost: float
    quantity: float
    subtotal: float


class CalculatorResponse(BaseModel):
    materials: list[MaterialLine]
    total_cost: float
    suggested_price: float
    profit: float


@router.post("/calculator/{category}", response_model=CalculatorResponse)
async def calculate(
    category: str,
    payload: CalculatorRequest,
    user: dict = Depends(get_current_user),
):
    if category not in MATERIALS:
        raise HTTPException(
            status_code=404,
            detail=f"No calculator materials for category '{category}'. "
                   f"Available: {list(MATERIALS.keys())}",
        )

    materials_list = MATERIALS[category]
    lines = []
    total_cost = 0.0

    for index, qty in payload.quantities.items():
        if index < 0 or index >= len(materials_list):
            continue
        material = materials_list[index]
        subtotal = material["cost"] * qty
        total_cost += subtotal
        lines.append(MaterialLine(
            name=material["name"],
            unit_cost=material["cost"],
            quantity=qty,
            subtotal=round(subtotal, 2),
        ))

    suggested_price = round(total_cost * MARKUP_MULTIPLIER, 2)
    profit = round(suggested_price - total_cost, 2)

    return CalculatorResponse(
        materials=lines,
        total_cost=round(total_cost, 2),
        suggested_price=suggested_price,
        profit=profit,
    )