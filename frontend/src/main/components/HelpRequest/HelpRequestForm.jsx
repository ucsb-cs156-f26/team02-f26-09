import { Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function HelpRequestForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });
  // Stryker restore all

  const navigate = useNavigate();

  const testIdPrefix = "HelpRequestForm";
  const isodate_regex =
    /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/i;
  const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Row>
        {initialContents && (
          <Col>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="id">Id</Form.Label>
              <Form.Control
                data-testid={testIdPrefix + "-id"}
                id="id"
                type="text"
                {...register("id")}
                value={initialContents.id}
                disabled
              />
            </Form.Group>
          </Col>
        )}

        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="requesterEmail">Requester Email</Form.Label>
            <Form.Control
              data-testid={testIdPrefix + "-requesterEmail"}
              id="requesterEmail"
              type="text"
              isInvalid={Boolean(errors.requesterEmail)}
              {...register("requesterEmail", {
                required: "Requester Email is required.",
                maxLength: {
                  value: 255,
                  message:
                    "Requester Email has a max length of 255 characters.",
                },
                pattern: {
                  value: email_regex,
                  message: "Requester Email must be a valid email address.",
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.requesterEmail?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="teamId">Team Id</Form.Label>
            <Form.Control
              data-testid={testIdPrefix + "-teamId"}
              id="teamId"
              type="text"
              isInvalid={Boolean(errors.teamId)}
              {...register("teamId", {
                required: "Team Id is required.",
                maxLength: {
                  value: 255,
                  message: "Team Id has a max length of 255 characters.",
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.teamId?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="tableOrBreakoutRoom">
              Table or Breakout Room
            </Form.Label>
            <Form.Control
              data-testid={testIdPrefix + "-tableOrBreakoutRoom"}
              id="tableOrBreakoutRoom"
              type="text"
              isInvalid={Boolean(errors.tableOrBreakoutRoom)}
              {...register("tableOrBreakoutRoom", {
                required: "Table or Breakout Room is required.",
                maxLength: {
                  value: 255,
                  message:
                    "Table or Breakout Room has a max length of 255 characters.",
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.tableOrBreakoutRoom?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="requestTime">
              Request Time (iso format)
            </Form.Label>
            <Form.Control
              data-testid={testIdPrefix + "-requestTime"}
              id="requestTime"
              type="datetime-local"
              isInvalid={Boolean(errors.requestTime)}
              {...register("requestTime", {
                required: "Request Time is required.",
                pattern: isodate_regex,
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.requestTime?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="explanation">Explanation</Form.Label>
            <Form.Control
              data-testid={testIdPrefix + "-explanation"}
              id="explanation"
              type="text"
              isInvalid={Boolean(errors.explanation)}
              {...register("explanation", {
                required: "Explanation is required.",
                maxLength: {
                  value: 255,
                  message: "Explanation has a max length of 255 characters.",
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.explanation?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Check
              data-testid={testIdPrefix + "-solved"}
              id="solved"
              type="checkbox"
              label="Solved"
              {...register("solved")}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Button type="submit" data-testid={testIdPrefix + "-submit"}>
            {buttonLabel}
          </Button>
          <Button
            variant="Secondary"
            onClick={() => navigate(-1)}
            data-testid={testIdPrefix + "-cancel"}
          >
            Cancel
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default HelpRequestForm;
