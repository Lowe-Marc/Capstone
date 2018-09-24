#include "Test.h"
#include "stdafx.h"

static int testArr[] = { {0},{0} };
static int testSize[] = { 0, 0 };


Test::Test() {
}

Test::~Test() {
}

//int Test::testRunSim() {
//
//	testSize = 10;
//	testArr[testSize] = {0};
//
//	for (int i = 0; i < testSize; i++) {
//		testArr[i] = i;
//	}
//
//	return testSize;
//}
//
//bool Test::testGetResults(int handle[]) {
//	for (int i = 0; i < testSize; i++) {
//		handle[i] = testArr[i];
//	}
//
//	return true;
//}


// Should return an array of ints, each int represents the number of nodes in that frame
int * Test::testRunSim() {

	// Indicates the number of nodes in the frames
	testSize[0] = 1;
	testSize[1] = 3;

	// Indicates the node IDs in each frame
	testArr[0] = { 0 };
	testArr[1] = { 1 };

	return &testSize[0];
}

// Return the number of animation frames in the simulation results
bool Test::getFrameCount(int handle) {
	handle = 2;
	return true;
}

// Return the number of nodes animated in each frame
bool Test::getFrameSizes(int handle[]) {
	for (int i = 0; i < sizeof(testSize); i++) {
		handle[i] = testSize[i];
	}
	return true;
}

bool Test::testGetResults(int handle[]) {
	handle[0] = testArr[0];
	handle[1] = testArr[1];

	return true;
}
