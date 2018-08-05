#include "Test.h"
#include "stdafx.h"

static int testArr[] = {0,1};
static int testSize = 0;


Test::Test() {
}

Test::~Test() {
}

int Test::testRunSim() {

	testSize = 10;
	testArr[testSize] = {0};

	for (int i = 0; i < testSize; i++) {
		testArr[i] = i;
	}

	return testSize;
}

bool Test::testGetResults(int handle[]) {
	for (int i = 0; i < testSize; i++) {
		handle[i] = testArr[i];
	}

	return true;
}
