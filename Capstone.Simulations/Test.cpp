#include "Test.h"
#include "stdafx.h"

static AnimationsStruct testStruct;
static int testSize;


Test::Test() {
}

Test::~Test() {
}

int Test::testRunSim() {

	testSize = 10;
	testStruct.values[testSize] = {};

	for (int i = 0; i < testSize; i++) {
		testStruct.values[i] = i;
	}

	return testSize;
}

bool Test::testGetResults(AnimationsStruct* handle) {
	for (int i = 0; i < testSize; i++) {
		handle->values[i] = i;
	}

	return true;
}
