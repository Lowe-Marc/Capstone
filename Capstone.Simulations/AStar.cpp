#include "AStar.h"
#include "stdafx.h"

AStar::AStar() 
{

}

AStar::~AStar() 
{

}

AStarCYAnimationFrame * AStar::simulate() 
{
	AStarCYAnimationFrame animations[4];

	//First
	AStarCYAnimationFrame firstFrame;
	AStarCYNode firstNode;
	firstNode.id = "La Crosse";

	vector<AStarCYNode> firstNodes;
	firstNodes.push_back(firstNode);
	firstFrame.nodes = firstNodes;
	animations[0] = firstFrame;


	//Second
	AStarCYAnimationFrame secondFrame;
	AStarCYNode secondNode;
	secondNode.id = "La Crescent";

	vector<AStarCYNode> secondNodes;
	secondNodes.push_back(secondNode);
	secondFrame.nodes = secondNodes;
	animations[1] = secondFrame;


	//Third
	AStarCYAnimationFrame thirdFrame;
	AStarCYNode thirdNode;
	thirdNode.id = "Winona";

	vector<AStarCYNode> thirdNodes;
	thirdNodes.push_back(thirdNode);
	thirdFrame.nodes = thirdNodes;
	animations[2] = thirdFrame;


	//Fourth
	AStarCYAnimationFrame fourthFrame;
	AStarCYNode fourthNode;
	fourthNode.id = "Minneapolis";

	vector<AStarCYNode> fourthNodes;
	fourthNodes.push_back(fourthNode);
	fourthFrame.nodes = fourthNodes;
	animations[3] = fourthFrame;

	return animations;
}