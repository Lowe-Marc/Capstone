#pragma once
#include "AStar.h"

#ifdef __cplusplus
extern "C" {
#endif

	extern __declspec(dllexport) AStar* CreateAStar();
	extern __declspec(dllexport) void DeleteAStar(AStar* astar);
	extern __declspec(dllexport) AStarCYAnimationFrame * Simulate(AStar* astar);


#ifdef __cplusplus
}
#endif