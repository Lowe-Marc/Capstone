#include "AStarCaller.h"
#include "stdafx.h"


AStar* CreateAStar()
{
	return new AStar();
}

void DeleteAStar(AStar* astar)
{
	if (astar != nullptr)
	{
		delete astar;
		astar = nullptr;
	}
}

AStarCYAnimationFrame * Simulate(AStar* astar)
{
	if (astar != nullptr)
	{
		return astar->simulate();
	}
	AStarCYAnimationFrame animations[1];
	return animations;
}