#pragma once
# include <vector>

using namespace std;

struct AStarCYNode
{
	string id;
	double x;
	double y;
};

struct AStarCYEdge
{
	string source;
	string target;
	double distance;
	double heuristicValue;
};

struct AStarCYAnimationFrame
{
	vector<AStarCYNode> nodes;
	vector<AStarCYEdge> edges;
};

class __declspec(dllexport) AStar
{
public:
	AStar();
	~AStar();
	AStarCYAnimationFrame * simulate();
};